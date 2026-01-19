import React, { useState } from "react";
import axios from "axios";
// 👇 PayPal Imports
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"; 
import "./App.css";

import Admin from './Admin';
import Login from './Login';
import UserDashboard from './UserDashboard'; 
import { FaHeart, FaSeedling, FaChild } from 'react-icons/fa'; 

function App() {
  const [currentPage, setCurrentPage] = useState('login'); 
  const [currentUser, setCurrentUser] = useState({}); 
  const [formData, setFormData] = useState({ amount: '' }); 

  // --- LOGIN / LOGOUT LOGIC ---
  const handleLogin = (role, userData) => {
      setCurrentUser(userData); 
      if (role === 'admin') setCurrentPage('admin');
      else setCurrentPage('userDashboard');
  };

  const handleLogout = () => {
      setCurrentPage('login');
      setCurrentUser({});
      setFormData({ amount: '' }); 
  };

  return (
    <div className="App">
      
      {/* 1. LOGIN PAGE */}
      {currentPage === 'login' && <Login onLogin={handleLogin} />}

      {/* 2. ADMIN DASHBOARD */}
      {currentPage === 'admin' && (
          <div style={{width: '100%'}}>
              <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
              <Admin currentUser={currentUser} />
          </div>
      )}

      {/* 3. USER DASHBOARD */}
      {currentPage === 'userDashboard' && (
          <UserDashboard 
            userEmail={currentUser.email} 
            onDonateClick={() => setCurrentPage('donateForm')} 
            onLogout={handleLogout}
          />
      )}

      {/* 4. DONATION PAGE (With INR Support) */}
      {currentPage === 'donateForm' && (
        <div className="container">
          <div className="card" style={{maxWidth: '500px', position: 'relative'}}>
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
                    <li style={{marginBottom: '5px'}}>₹ 500: Feeds a child for a day. <FaChild/></li>
                    <li style={{marginBottom: '5px'}}>₹ 1000: Plants 2 saplings. <FaSeedling/></li>
                    <li>₹ 5000: Sponsors education for a month. <FaHeart/></li>
                </ul>
            </div>
            
            {/* Donation Inputs */}
            <div className="form">
               <div className="input-group">
                  <label>Donor Name</label>
                  <input type="text" value={currentUser.name || "Anonymous"} readOnly style={{background:'#eee', cursor: 'not-allowed'}}/>
              </div>
              
              {/* 👇 Amount Input in INR (₹) */}
              <div className="input-group">
                  <label style={{ color: "#166534", fontWeight: "bold" }}>Amount (₹ INR)</label>
                  <input 
                    type="number" 
                    placeholder="Enter amount (e.g. 500)"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})} 
                    required 
                    style={{fontSize: '18px', fontWeight: 'bold', color: '#4c1d95'}}
                  />
              </div>

              {/* 👇 PAYPAL BUTTONS SECTION 👇 */}
              <div style={{ marginTop: "20px", zIndex: "0" }}>
                
                <PayPalScriptProvider options={{ "client-id": "AdMpAG7oSD6GWweCB1pffd277NvxK7afQFprlXXiqQz6vOcjunYyBNKSn5REmDo2kWrPWz1BScS2SCGV" }}>
                  
                  <PayPalButtons 
                    style={{ layout: "vertical" }} 
                    
                    // A. Create Order (with Auto-Conversion)
                    createOrder={(data, actions) => {
                      if (!formData.amount || formData.amount <= 0) {
                        alert("Please enter a valid amount (₹) first!");
                        return actions.reject();
                      }

                      // 💡 SMART CONVERSION: ₹ to $ (Approx 1 USD = 84 INR)
                      // User inputs ₹500 -> PayPal gets $5.95
                      const usdAmount = (formData.amount / 84).toFixed(2);

                      return actions.order.create({
                        purchase_units: [
                          {
                            amount: {
                              value: usdAmount, // Sending Dollars to PayPal
                              currency_code: "USD" 
                            },
                            description: `Donation of ₹${formData.amount}` // Receipt shows INR amount
                          },
                        ],
                      });
                    }}

                    // B. Payment Success
                    onApprove={(data, actions) => {
                      return actions.order.capture().then(async (details) => {
                        const name = details.payer.name.given_name;
                        alert(`Payment Successful! Thank you ${name}`);
                        
                        // 🎉 Save ORIGINAL Rupee Amount (₹) to Database
                        try {
                             await axios.post('http://localhost:5000/api/donate', {
                                email: currentUser.email, 
                                amount: formData.amount, // Saving ₹500 (Not dollar amount)
                                status: "Success",
                                transactionId: details.id
                             });
                             console.log("Database Updated with INR Amount");
                        } catch (err) {
                             console.error("DB Error", err);
                        }

                        // Redirect user back to dashboard
                        setCurrentPage('userDashboard');
                      });
                    }}
                    
                    // C. Error Handling
                    onError={(err) => {
                      console.error("PayPal Error:", err);
                      alert("Payment Failed. Please try again.");
                    }}
                  />

                </PayPalScriptProvider>
              </div>
              {/* 👆 PAYPAL SECTION ENDS 👆 */}

            </div>
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