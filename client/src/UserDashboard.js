import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css'; 
import { FaHistory, FaHandHoldingHeart, FaWallet, FaCheckCircle, FaTimesCircle, FaClock, FaTree, FaBookOpen, FaUtensils } from 'react-icons/fa';

function UserDashboard({ userEmail, onDonateClick, onLogout }) {
    const [user, setUser] = useState(null);
    const [totalDonated, setTotalDonated] = useState(0);

    // LOGIC SAME AS BEFORE
    useEffect(() => {
        axios.get('http://localhost:5000/api/users')
            .then(res => {
                const myProfile = res.data.find(u => u.email === userEmail);
                if (myProfile) {
                    setUser(myProfile);
                    const sum = myProfile.donations
                        .filter(d => d.status === 'Success')
                        .reduce((acc, curr) => acc + Number(curr.amount), 0);
                    setTotalDonated(sum);
                }
            })
            .catch(err => console.error("Error loading data", err));
    }, [userEmail]);

    const getStatusBadge = (status) => {
        if (status === 'Success') return <span className="badge success"><FaCheckCircle/> Success</span>;
        if (status === 'Failed') return <span className="badge failed"><FaTimesCircle/> Failed</span>;
        return <span className="badge pending"><FaClock/> Pending</span>;
    };

    return (
        <div style={{ width: '100%', maxWidth: '1000px', padding: '20px' }}>
            
            {/* 1. TOP STATS */}
            <div className="stats-container">
                <div className="stat-card">
                    <div className="stat-icon" style={{background: '#e0e7ff', color: '#6366f1'}}><FaWallet/></div>
                    <div><h3>LKR {totalDonated}</h3><p>My Contribution</p></div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{background: '#dcfce7', color: '#166534'}}><FaHandHoldingHeart/></div>
                    <div><h3>{user?.donations?.length || 0}</h3><p>Donations Made</p></div>
                </div>
            </div>

            {/* 2. MAIN WELCOME CARD */}
            <div className="card" style={{ marginTop: '20px', textAlign: 'left', animation: 'fadeIn 0.8s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 className="title">👋 Hello, {user?.name || 'Changemaker'}</h2>
                    <button onClick={onLogout} style={{ color: '#dc3545', fontWeight: 'bold', background: 'none', border: 'none', cursor: 'pointer' }}>Logout</button>
                </div>
                
                {/* 🎨 DECORATION: MISSION SECTION */}
                <div className="mission-section" style={{marginTop: '20px', background: '#f9fafb', padding: '20px', borderRadius: '12px'}}>
                    <h3 style={{color: '#4c1d95', marginBottom: '15px'}}>🌍 Where does your money go?</h3>
                    
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px'}}>
                        {/* Cause 1 */}
                        <div style={{background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'}}>
                            <FaBookOpen style={{color: '#3b82f6', fontSize: '24px', marginBottom: '10px'}}/>
                            <h4 style={{margin: '0 0 5px 0'}}>Educating Poor Children</h4>
                            <p style={{fontSize: '12px', color: '#666'}}>We provide books, uniforms, and tuition fees to underprivileged kids in rural areas.</p>
                        </div>

                        {/* Cause 2 */}
                        <div style={{background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'}}>
                            <FaUtensils style={{color: '#f59e0b', fontSize: '24px', marginBottom: '10px'}}/>
                            <h4 style={{margin: '0 0 5px 0'}}>Food for Everyone</h4>
                            <p style={{fontSize: '12px', color: '#666'}}>No child should sleep hungry. We run daily food drives for the homeless.</p>
                        </div>

                        {/* Cause 3 */}
                        <div style={{background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'}}>
                            <FaTree style={{color: '#10b981', fontSize: '24px', marginBottom: '10px'}}/>
                            <h4 style={{margin: '0 0 5px 0'}}>Green Earth Initiative</h4>
                            <p style={{fontSize: '12px', color: '#666'}}>Partnering with planting associations to plant 10,000 trees this year.</p>
                        </div>
                    </div>
                    
                    <div style={{marginTop: '15px', fontSize: '13px', color: '#555', fontStyle: 'italic', borderTop: '1px solid #eee', paddingTop: '10px'}}>
                        <strong>Why Donate?</strong> Your small contribution can buy a book, feed a family, or plant a life. We ensure 100% transparency.
                    </div>
                </div>

                <button onClick={onDonateClick} className="donate-btn big-btn" style={{ marginTop: '20px' }}>
                    <FaHandHoldingHeart style={{ marginRight: '10px' }} />
                    Make a Difference Today
                </button>
            </div>

            {/* 3. HISTORY TABLE (Logic Same) */}
            <div className="card" style={{ marginTop: '20px', animation: 'slideUp 1s' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', color: '#333' }}>
                    <FaHistory style={{ marginRight: '10px', color: '#667eea' }} />
                    Your Impact History
                </h3>
                <div className="table-wrapper">
                    <table className="custom-table">
                        <thead><tr><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
                        <tbody>
                            {user?.donations?.slice().reverse().map((item, index) => ( 
                                <tr key={index}>
                                    <td>{new Date(item.date).toLocaleDateString()}</td>
                                    <td style={{ fontWeight: 'bold' }}>LKR {item.amount}</td>
                                    <td>{getStatusBadge(item.status)}</td>
                                </tr>
                            ))}
                            {(!user?.donations || user.donations.length === 0) && (
                                <tr><td colSpan="3" style={{textAlign:'center', padding:'20px'}}>No donations yet. Start your journey today!</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default UserDashboard;