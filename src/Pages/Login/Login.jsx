// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import "./LoginSignUp.css";
// import { FaUser, FaLock, FaEnvelope, FaRegAddressCard, FaPhoneAlt } from "react-icons/fa";

// const LoginSignUp = () => {
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     number: "",
//     regNo: "",
//     password: "",
//   });
//   const [error, setError] = useState("");
//   const [isLogin, setIsLogin] = useState(true); // Determine if login or register form is active
//   const [isSubmitting, setIsSubmitting] = useState(false); // Track if the form is being submitted
//   const navigate = useNavigate();

//   const handleFormToggle = () => {
//     setIsLogin(!isLogin);
//     setError(""); // Reset error when switching forms
//   };

//   const handleLoginSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true); // Disable submit button
//     try {
//       const response = await fetch("http://localhost:5000/login", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           regNo: formData.regNo,
//           password: formData.password,
//         }),
//       });

//       const result = await response.json();
//       if (response.ok) {
//         localStorage.setItem("token", result.token);
//         alert(result.message); // Show success message
//         navigate("/home");
//       } else {
//         setError(result.error || "Login failed");
//       }
//     } catch (err) {
//       setError("An error occurred. Please try again.");
//       console.error(err);
//     } finally {
//       setIsSubmitting(false); // Re-enable submit button after the request completes
//     }
//   };

//   const handleRegisterSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true); // Disable submit button
//     try {
//       const response = await fetch("http://localhost:5000/register", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           name: formData.name,
//           email: formData.email,
//           number: formData.number,
//           regNo: formData.regNo,
//           password: formData.password,
//         }),
//       });

//       const result = await response.json();
//       if (response.ok) {
//         alert(result.message);
//         setIsLogin(true); // Switch to login form after successful registration
//       } else {
//         setError(result.error || "Registration failed");
//       }
//     } catch (err) {
//       setError("An error occurred. Please try again.");
//       console.error(err);
//     } finally {
//       setIsSubmitting(false); // Re-enable submit button after the request completes
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prevState) => ({
//       ...prevState,
//       [name]: value,
//     }));
//   };

//   // Check if the user is already logged in
//   // useEffect(() => {
//   //   const token = localStorage.getItem("token");
//   //   if (token) {
//   //     navigate("/home"); // Redirect to Home if the user is logged in
//   //     // return null; // Prevent rendering the login/signup form
//   //   }
//   // }, [navigate]);

//   return (
//     <div className={`wrapper ${isLogin ? "" : "active"}`}>
//       <span className="rotate-bg"></span>
//       <span className="rotate-bg2"></span>

//       {/* Login Form */}
//       {isLogin ? (
//         <div className="form-box login">
//           <h2 className="title animation" style={{ "--i": 0, "--j": 20 }}>
//             Login
//           </h2>
//           <form onSubmit={handleLoginSubmit}>
//             <div className="input-box animation" style={{ "--i": 1, "--j": 21 }}>
//               <input
//                 type="text"
//                 required
//                 name="regNo"
//                 value={formData.regNo}
//                 onChange={handleChange}
//               />
//               <label htmlFor="regNo">Reg. No.</label>
//               <FaRegAddressCard className="icon" />
//             </div>
//             <div className="input-box animation" style={{ "--i": 2, "--j": 22 }}>
//               <input
//                 type="password"
//                 required
//                 name="password"
//                 value={formData.password}
//                 onChange={handleChange}
//               />
//               <label htmlFor="password">Password</label>
//               <FaLock className="icon" />
//             </div>
//             {error && <p className="error">{error}</p>}
//             <button
//               type="submit"
//               className="btn animation"
//               style={{ "--i": 3, "--j": 23 }}
//               disabled={isSubmitting} // Disable button during submission
//             >
//               {isSubmitting ? "Logging in..." : "Login"}
//             </button>
//             <div className="linkTxt animation" style={{ "--i": 4, "--j": 24 }}>
//               <p>
//                 Don't have an account?{" "}
//                 <a
//                   href="#"
//                   onClick={handleFormToggle}
//                   className="register-link"
//                 >
//                   Sign Up
//                 </a>
//               </p>
//             </div>
//           </form>
//         </div>
//       ) : (
//         /* Registration Form */
//         <div className="form-box register">
//           <h2 className="title animation" style={{ "--i": 17, "--j": 0 }}>
//             Sign Up
//           </h2>
//           <form onSubmit={handleRegisterSubmit}>
//             <div className="input-box animation" style={{ "--i": 18, "--j": 1 }}>
//               <input
//                 type="text"
//                 required
//                 name="name"
//                 value={formData.name}
//                 onChange={handleChange}
//               />
//               <label htmlFor="name">Name</label>
//               <FaUser className="icon" />
//             </div>
//             <div className="input-box animation" style={{ "--i": 19, "--j": 2 }}>
//               <input
//                 type="email"
//                 required
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//               />
//               <label htmlFor="email">Email</label>
//               <FaEnvelope className="icon" />
//             </div>
//             <div className="input-box animation" style={{ "--i": 19, "--j": 2 }}>
//               <input
//                 type="tel" // Use 'tel' for phone number input type
//                 required
//                 name="number"
//                 value={formData.number}
//                 onChange={handleChange}
//               />
//               <label htmlFor="number">Phone Number</label>
//               <FaPhoneAlt className="icon" /> {/* Use phone icon */}
//             </div>
//             <div className="input-box animation" style={{ "--i": 20, "--j": 3 }}>
//               <input
//                 type="text"
//                 required
//                 name="regNo"
//                 value={formData.regNo}
//                 onChange={handleChange}
//               />
//               <label htmlFor="regNo">Reg. No.</label>
//               <FaRegAddressCard className="icon" />
//             </div>
//             <div className="input-box animation" style={{ "--i": 21, "--j": 4 }}>
//               <input
//                 type="password"
//                 required
//                 name="password"
//                 value={formData.password}
//                 onChange={handleChange}
//               />
//               <label htmlFor="password">Password</label>
//               <FaLock className="icon" />
//             </div>
//             {error && <p className="error">{error}</p>}
//             <button
//               type="submit"
//               className="btn animation"
//               style={{ "--i": 23, "--j": 6 }}
//               disabled={isSubmitting} // Disable button during submission
//             >
//               {isSubmitting ? "Signing up..." : "Sign Up"}
//             </button>
//             <div className="linkTxt animation" style={{ "--i": 24, "--j": 7 }}>
//               <p>
//                 Already have an account?{" "}
//                 <a href="#" onClick={handleFormToggle} className="login-link">
//                   Login
//                 </a>
//               </p>
//             </div>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// };

// export default LoginSignUp;

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
