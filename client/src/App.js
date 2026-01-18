import React, { useState } from 'react';
import axios from 'axios';
import './App.css'; 
import Admin from './Admin';
import Login from './Login';
import UserDashboard from './UserDashboard'; 
import { FaHeart, FaSeedling, FaChild } from 'react-icons/fa'; // Import new icons

function App() {
  const [currentPage, setCurrentPage] = useState('login'); 
  const [currentUser, setCurrentUser] = useState({}); 
  const [formData, setFormData] = useState({ amount: '' }); 

  // --- LOGIC REMAINS EXACTLY THE SAME ---
  const handleLogin = (role, userData) => {
      setCurrentUser(userData); 
      if (role === 'admin') setCurrentPage('admin');
      else setCurrentPage('userDashboard');
  };

  const handleLogout = () => {
      setCurrentPage('login');
      setCurrentUser({});
  };

  const handleDonate = async (e) => {
    e.preventDefault();
    // 1. Save to DB
    try {
      await axios.post('http://localhost:5000/api/donate', {
        email: currentUser.email, amount: formData.amount, status: "Pending"
      });
    } catch (err) { alert("Error saving data"); return; }

    // 2. Hash
    const orderId = "Order_" + new Date().getTime(); 
    let hash;
    try {
        const res = await axios.post('http://localhost:5000/api/generate-hash', {
            order_id: orderId, amount: formData.amount, currency: "LKR"
        });
        hash = res.data.hash;
    } catch (err) { alert("Backend Error"); return; }

    // 3. Payment
    const payment = {
      sandbox: true, merchant_id: "1233644", 
      return_url: "http://localhost:3000/", cancel_url: "http://localhost:3000/",
      notify_url: "http://localhost:5000/api/notify", order_id: orderId, items: "Donation",
      amount: formData.amount, currency: "LKR", hash: hash, 
      first_name: currentUser.name, last_name: "", email: currentUser.email, phone: currentUser.phone, address: "Col", city: "Col", country: "SL",
    };

    if (window.payhere) {
        window.payhere.startPayment(payment);
        window.payhere.onCompleted = function() { alert("Payment Successful!"); setCurrentPage('userDashboard'); };
        window.payhere.onDismissed = function() { alert("Payment Skipped"); setCurrentPage('userDashboard'); };
        window.payhere.onError = function(err) { alert("Error: " + err); };
    }
  };

  return (
    <div className="App">
      
      {currentPage === 'login' && <Login onLogin={handleLogin} />}

      {currentPage === 'admin' && (
          <div style={{width: '100%'}}>
              <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
              <Admin currentUser={currentUser} />
          </div>
      )}

      {currentPage === 'userDashboard' && (
          <UserDashboard 
            userEmail={currentUser.email} 
            onDonateClick={() => setCurrentPage('donateForm')} 
            onLogout={handleLogout}
          />
      )}

      {/* 🎨 DECORATED DONATION PAGE */}
      {currentPage === 'donateForm' && (
        <div className="container">
          <div className="card" style={{maxWidth: '500px'}}>
            <button onClick={() => setCurrentPage('userDashboard')} style={styles.backBtn}>← Back</button>
            
            {/* Header Decoration */}
            <div style={{textAlign: 'center', marginBottom: '20px'}}>
                 <h1 className="title" style={{marginTop: '20px'}}>💙 Donate Hope</h1>
                 <p className="subtitle">Your generosity has the power to change lives.</p>
            </div>

            {/* Impact Box */}
            <div style={{background: '#f0fdf4', padding: '15px', borderRadius: '10px', border: '1px solid #bbf7d0', marginBottom: '20px'}}>
                <h4 style={{margin: '0 0 10px 0', color: '#166534', fontSize: '14px'}}>What your donation can do:</h4>
                <ul style={{fontSize: '12px', color: '#14532d', paddingLeft: '20px', margin: 0}}>
                    <li style={{marginBottom: '5px'}}>LKR 500: Feeds a child for a day. <FaChild/></li>
                    <li style={{marginBottom: '5px'}}>LKR 1000: Plants 2 saplings. <FaSeedling/></li>
                    <li>LKR 5000: Sponsors education for a month. <FaHeart/></li>
                </ul>
            </div>
            
            <form onSubmit={handleDonate} className="form">
               <div className="input-group">
                  <label>Donor Name</label>
                  <input type="text" value={currentUser.name} readOnly style={{background:'#eee', cursor: 'not-allowed'}}/>
              </div>
              
              <div className="input-group">
                  <label>Amount (LKR)</label>
                  <input 
                    type="number" 
                    placeholder="Enter amount (e.g. 1000)"
                    onChange={(e) => setFormData({...formData, amount: e.target.value})} 
                    required 
                    style={{fontSize: '18px', fontWeight: 'bold', color: '#4c1d95'}}
                  />
              </div>

              <button type="submit" className="donate-btn big-btn">
                 Proceed to Pay
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

const styles = {
    logoutBtn: { position: 'absolute', top: '20px', right: '20px', padding: '10px 20px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', zIndex: 100 },
    backBtn: { position: 'absolute', top: '20px', left: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontWeight: 'bold' }
};

export default App;