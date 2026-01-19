import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import { FaUsers, FaMoneyBillWave, FaExchangeAlt, FaUserCog, FaCheckCircle, FaTimesCircle, FaClock, FaArrowUp, FaArrowDown, FaCrown, FaLock } from 'react-icons/fa';

function Admin({ currentUser }) {
    const [users, setUsers] = useState([]);
    const [allTransactions, setAllTransactions] = useState([]);
    const [totalCollection, setTotalCollection] = useState(0);
    const [activeTab, setActiveTab] = useState('users'); 

    // --- FETCH DATA ---
    const fetchUsers = () => {
        axios.get('http://localhost:5000/api/users')
            .then(res => {
                setUsers(res.data);
                processData(res.data);
            })
            .catch(err => console.error("Error fetching data:", err));
    };

    // --- PROCESS DATA (Calculate Totals) ---
    const processData = (usersData) => {
        let grandTotal = 0;
        let transactions = [];

        usersData.forEach(user => {
            if (user.donations) {
                user.donations.forEach(donation => {
                    // 1. Add to Grand Total (Only Success)
                    if (donation.status === 'Success') {
                        grandTotal += Number(donation.amount);
                    }
                    // 2. Add to Big List of Transactions
                    transactions.push({
                        donorName: user.name,
                        donorEmail: user.email,
                        amount: donation.amount,
                        status: donation.status,
                        date: donation.date
                    });
                });
            }
        });

        // Sort by latest date
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        setTotalCollection(grandTotal);
        setAllTransactions(transactions);
    };

    // --- ACTION 1: PROMOTE (Make Admin) ---
    const makeAdmin = (email) => {
        if(window.confirm(`Are you sure you want to promote ${email} to Admin?`)) {
            axios.post('http://localhost:5000/api/promote', { email })
                .then(() => {
                    alert("User Promoted Successfully!");
                    fetchUsers(); // Refresh list
                })
                .catch(err => alert("Error updating role"));
        }
    };

    // --- ACTION 2: DEMOTE (Remove Admin) ---
    const removeAdmin = (email) => {
        if(window.confirm(`Are you sure you want to REMOVE Admin rights from ${email}?`)) {
            axios.post('http://localhost:5000/api/demote', { email })
                .then(() => {
                    alert("User Demoted to Normal User!");
                    fetchUsers(); // Refresh list
                })
                .catch(err => {
                    // Show error from backend (e.g. "Cannot demote Superadmin")
                    alert(err.response?.data?.message || "Error updating role");
                });
        }
    };

    // Load data on page load
    useEffect(() => {
        fetchUsers();
    }, []);

    // Helper for Status Badge
    const getStatusBadge = (status) => {
        if (status === 'Success') return <span className="badge success"><FaCheckCircle/> Success</span>;
        if (status === 'Failed') return <span className="badge failed"><FaTimesCircle/> Failed</span>;
        return <span className="badge pending"><FaClock/> Pending</span>;
    };

    // ✅ CHECK: Is the logged-in user the Superadmin?
    const isSuperAdmin = currentUser?.email === 'admin@gmail.com';

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            
            {/* 1. ADMIN STATS (Always Visible) */}
            <div className="stats-container">
                <div className="stat-card">
                    <div className="stat-icon" style={{background: '#dcfce7', color: '#166534'}}><FaMoneyBillWave/></div>
                    <div>
                        {/* 👇 UPDATED TO RUPEE SYMBOL */}
                        <h3>₹ {totalCollection}</h3>
                        <p>Total Collection</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{background: '#e0e7ff', color: '#6366f1'}}><FaUsers/></div>
                    <div>
                        <h3>{users.length}</h3>
                        <p>Total Users</p>
                    </div>
                </div>
            </div>

            {/* 2. TAB BUTTONS (Switch between Users & Transactions) */}
            <div style={{ display: 'flex', gap: '15px', margin: '20px 0' }}>
                <button 
                    onClick={() => setActiveTab('users')}
                    className="donate-btn"
                    style={{ background: activeTab === 'users' ? '#7c3aed' : '#e2e8f0', color: activeTab === 'users' ? 'white' : '#64748b', flex: 1 }}
                >
                    <FaUserCog style={{marginRight: '8px'}}/> Manage Users
                </button>
                <button 
                    onClick={() => setActiveTab('transactions')}
                    className="donate-btn"
                    style={{ background: activeTab === 'transactions' ? '#7c3aed' : '#e2e8f0', color: activeTab === 'transactions' ? 'white' : '#64748b', flex: 1 }}
                >
                    <FaExchangeAlt style={{marginRight: '8px'}}/> Transactions
                </button>
            </div>

            {/* 3. CONDITIONAL RENDERING */}
            
            {/* VIEW A: USER MANAGEMENT TABLE */}
            {activeTab === 'users' && (
                <div className="card" style={{ maxWidth: '100%', animation: 'fadeIn 0.5s' }}>
                    <h2 className="title">User Management</h2>

                    {/* Security Notice for Normal Admins */}
                    {!isSuperAdmin && (
                        <p style={{fontSize:'13px', color:'#dc3545', background:'#fff5f5', padding:'10px', borderRadius:'5px', border:'1px solid #fed7d7', marginBottom: '15px'}}>
                            <FaLock style={{marginRight:'5px'}}/> Only Superadmin can change user roles.
                        </p>
                    )}

                    <div className="table-wrapper">
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Role</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user._id}>
                                        <td>
                                            <span style={{fontWeight:'bold'}}>{user.name}</span><br/>
                                            <span style={{fontSize:'12px', color:'#888'}}>{user.email}</span>
                                        </td>
                                        <td>
                                            {/* Special Badge for Superadmin */}
                                            {user.email === 'admin@gmail.com' ? (
                                                <span className="badge" style={{background:'#FFD700', color:'#000', border:'1px solid #DAA520'}}>
                                                    <FaCrown/> SUPER ADMIN
                                                </span>
                                            ) : (
                                                <span className="badge" style={{
                                                    background: user.role === 'admin' ? '#dcfce7' : '#f1f5f9',
                                                    color: user.role === 'admin' ? '#166534' : '#64748b'
                                                }}>
                                                    {user.role.toUpperCase()}
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            {/* 🔒 LOGIC: Only show buttons if isSuperAdmin is TRUE 🔒 */}
                                            {isSuperAdmin ? (
                                                // If Superadmin, show logic (Protected for self, Buttons for others)
                                                user.email === 'admin@gmail.com' ? (
                                                    <span style={{fontSize:'12px', color:'#999', fontStyle:'italic'}}>
                                                        Protected
                                                    </span>
                                                ) : (
                                                    // Toggle Button: Remove Admin vs Make Admin
                                                    user.role === 'admin' ? (
                                                        <button 
                                                            onClick={() => removeAdmin(user.email)}
                                                            style={{ padding: '8px 12px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', display:'flex', alignItems:'center', gap:'5px' }}
                                                        >
                                                            <FaArrowDown/> Remove Admin
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={() => makeAdmin(user.email)}
                                                            style={{ padding: '8px 12px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', display:'flex', alignItems:'center', gap:'5px' }}
                                                        >
                                                            <FaArrowUp/> Make Admin
                                                        </button>
                                                    )
                                                )
                                            ) : (
                                                // If NOT Superadmin, show Lock Icon
                                                <span style={{fontSize:'12px', color:'#aaa', display:'flex', alignItems:'center', gap:'5px'}}>
                                                    <FaLock/> Read Only
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* VIEW B: TRANSACTION HISTORY TABLE */}
            {activeTab === 'transactions' && (
                <div className="card" style={{ maxWidth: '100%', animation: 'fadeIn 0.5s' }}>
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                        <h2 className="title">All Transactions</h2>
                        <button onClick={fetchUsers} style={{cursor:'pointer', background:'none', border:'none', color:'#667eea'}}>Refresh</button>
                    </div>
                    <div className="table-wrapper">
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>Donor</th>
                                    <th>Amount</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allTransactions.map((t, index) => (
                                    <tr key={index}>
                                        <td>{t.donorName}<br/><span style={{fontSize:'11px', color:'#999'}}>{t.donorEmail}</span></td>
                                        
                                        {/* 👇 UPDATED TO RUPEE SYMBOL */}
                                        <td style={{fontWeight:'bold'}}>₹ {t.amount}</td>
                                        
                                        <td>{new Date(t.date).toLocaleDateString()}</td>
                                        <td>{getStatusBadge(t.status)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {allTransactions.length === 0 && <p style={{textAlign:'center', padding:'20px'}}>No transactions yet.</p>}
                    </div>
                </div>
            )}

        </div>
    );
}

export default Admin;