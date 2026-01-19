import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import { FiMail, FiLock, FiUser, FiPhone } from 'react-icons/fi';
// removed FaHandHoldingHeart since it wasn't used in the view, but you can keep it if needed

function Login({ onLogin }) {
    const [isSignup, setIsSignup] = useState(false); 
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 👇 FIX 1: VALIDATION LOGIC BEFORE API CALL 👇
        if (isSignup) {
            // Check if phone number is exactly 10 digits
            if (!phone || phone.length !== 10) {
                alert("Please enter a valid 10-digit Mobile Number!");
                return; // 🛑 Stop here, do not send request
            }
        }

        // --- EXISTING LOGIC ---
        if (isSignup) {
            try {
                const res = await axios.post('http://localhost:5000/api/register', { name, email, phone, password });
                alert("Account Created! Logging you in...");
                onLogin(res.data.user.role, res.data.user); 
            } catch (err) {
                alert(err.response?.data?.message || "Error signing up");
            }
        } else {
            try {
                const res = await axios.post('http://localhost:5000/api/login', { email, password });
                onLogin(res.data.user.role, res.data.user);
            } catch (err) {
                alert("Invalid Credentials");
            }
        }
    };

    return (
        <div className="container">
            <div className="card" style={{animation: 'fadeIn 1s'}}>
                
                {/* 🎨 DECORATION 1: Image */}
                <img 
                    src="https://cdn-icons-png.flaticon.com/512/4522/4522549.png" 
                    alt="Charity" 
                    className="illustration"
                    style={{width: '120px', marginBottom: '10px'}}
                />

                <h1 className="title" style={{color: '#4c1d95'}}>💙 Hope Foundation</h1>
                
                {/* 🎨 DECORATION 2: Thought of the Day */}
                <div className="thought-box" style={{margin: '15px 0', padding: '10px', background: '#f3e8ff', borderRadius: '8px', borderLeft: '4px solid #7c3aed'}}>
                    <p style={{fontSize: '13px', fontStyle: 'italic', color: '#555', margin: 0}}>
                        "The best way to find yourself is to lose yourself in the service of others."
                    </p>
                    <span style={{fontSize: '11px', fontWeight: 'bold', color: '#7c3aed'}}>- Mahatma Gandhi</span>
                </div>

                <p className="subtitle">{isSignup ? "Join our community of changemakers." : "Welcome back, kindness dealer!"}</p>

                <form onSubmit={handleSubmit} className="form">
                    {isSignup && (
                        <>
                            <div className="input-wrapper">
                                <FiUser className="input-icon" />
                                <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required style={{ paddingLeft: '40px' }} />
                            </div>
                            
                            <div className="input-wrapper">
                                <FiPhone className="input-icon" />
                                {/* 👇 FIX 2: RESTRICT INPUT TO NUMBERS & 10 DIGITS ONLY 👇 */}
                                <input 
                                    type="text" 
                                    placeholder="Phone (10 digits)" 
                                    maxLength="10" 
                                    value={phone} 
                                    onChange={(e) => {
                                        // Only allow numbers (RegEx)
                                        const re = /^[0-9\b]+$/;
                                        if (e.target.value === '' || re.test(e.target.value)) {
                                            setPhone(e.target.value);
                                        }
                                    }} 
                                    required 
                                    style={{ paddingLeft: '40px' }} 
                                />
                            </div>
                        </>
                    )}

                    <div className="input-wrapper">
                        <FiMail className="input-icon" />
                        <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ paddingLeft: '40px' }} />
                    </div>

                    <div className="input-wrapper">
                        <FiLock className="input-icon" />
                        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ paddingLeft: '40px' }} />
                    </div>

                    <button type="submit" className="donate-btn big-btn">
                        {isSignup ? "Sign Up & Donate" : "Login Securely"}
                    </button>
                </form>

                <p style={{ fontSize: '13px', marginTop: '15px', color: '#666' }}>
                    {isSignup ? "Already have an account?" : "New here?"} 
                    <span onClick={() => setIsSignup(!isSignup)} style={{ color: '#667eea', fontWeight: 'bold', cursor: 'pointer', marginLeft: '5px' }}>
                        {isSignup ? "Login" : "Create Account"}
                    </span>
                </p>
            </div>
        </div>
    );
}

export default Login;