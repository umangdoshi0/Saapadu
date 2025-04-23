
import '../Login/Login.css';
import React, { useState } from 'react';
import {useNavigate } from 'react-router-dom';

const Login = () => {
    const [regNo, setRegno] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Use useNavigate for redirection
    const navigate = useNavigate(); 

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        if (!regNo || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ regNo, password }),
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Invalid credentials');
            }

            const data = await response.json();
            localStorage.setItem('token', data.token);
            console.log("Redirecting to home");
            navigate('/home'); // Use navigate for redirection
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        // <div className="container">
        //     <form className="form" onSubmit={handleLogin}>
        //         <div className="form_front">
        //             <div className="header">
        //                 <div className="text">LOGIN</div>
        //                 <div className="underline"></div>
        //             </div>
        //             <input
        //                 placeholder="Register Number"
        //                 className="input"
        //                 id='regNo'
        //                 type="text"
        //                 value={regNo}
        //                 onChange={(e) => setRegno(e.target.value)}
        //             />
        //             <input
        //                 placeholder="Password"
        //                 className="input"
        //                 id='password'
        //                 type="password"
        //                 value={password}
        //                 onChange={(e) => setPassword(e.target.value)}
        //             />
        //             {error && <p className="error">{error}</p>}
        //             <button className="btn" disabled={loading}>
        //                 {loading ? 'Logging in...' : 'Login'}
        //             </button>
        //             <span className="switch">
        //                 Don't have an account?
        //                 {/* <a className="signup_tog" href="/signup"> SIGN UP</a> */}
        //                 <button className="signup_tog" onClick={() => navigate('/signup')}> SIGN UP</button>

        //             </span>
        //         </div>
        //     </form>
        // </div>
         <>
            <div className="login-container">
            <div className='login-box'>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <input type="text" placeholder="Register Number"
                    id="regNo"
                    value={regNo}
                    onChange={(e) => setRegno(e.target.value)}
                />
                <input type="password" placeholder="password"
                    id="password"
                    value={password}
                onChange={(e) => setPassword(e.target.value)}
                />
                {error && <p className="error">{error}</p>}
                <button className= "submit-btn" disabled={loading}>
                    {loading?'Loggin in...' : 'Login'}
                </button>
                {/*  */}
               <p className='toggle-link'>Don't have a account? <span className='link' onClick={() => navigate('/signup')}>Register</span></p>
            </form>
            </div>
            </div>
        </>
    );
};

export default Login;
