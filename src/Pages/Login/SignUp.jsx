import "../Login/Login.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [name, setName] = useState("");
  const [regNo, setRegno] = useState("");
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Use useNavigate for redirection

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!name || !regNo || !email || !number || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/register", {
        // Make sure the URL is correct
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, number, regNo, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(errorData); // Log the error details for debugging
        throw new Error(errorData.error || "Signup failed");
      }

      console.log("Signed up successfully");
      // Redirect to login page after successful signup
      navigate("/login"); // Use navigate for redirection
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // <div className="container">
    //     <form className="form" onSubmit={handleSignup}>
    //         <div className="form_back">
    //             <div className="header">
    //                 <div className="text">SIGN UP</div>
    //                 <div className="underline"></div>
    //             </div>
    //             <input
    //                 placeholder="Name"
    //                 className="input"
    //                 id='name'
    //                 type="text"
    //                 value={name}
    //                 onChange={(e) => setName(e.target.value)}
    //             />
    //             <input
    //                 placeholder="Register Number"
    //                 className="input"
    //                 id='regNo'
    //                 type="text"
    //                 value={regNo}
    //                 onChange={(e) => setRegno(e.target.value)}
    //             />
    //             <input
    //                 placeholder="Email ID"
    //                 className="input"
    //                 id='email'
    //                 type="email"
    //                 value={email}
    //                 onChange={(e) => setEmail(e.target.value)}
    //             />
    //             <input
    //                 placeholder="Phone Number"
    //                 className="input"
    //                 id='number'
    //                 type="number"
    //                 value={number}
    //                 onChange={(e) => setNumber(e.target.value)}
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
    //                 {loading ? 'Signing up...' : 'Sign Up'}
    //             </button>
    //             <span className="switch">
    //                 Already have an account?
    //                 <a className="signup_tog" href="/"> SIGN IN</a>
    //             </span>
    //         </div>
    //     </form>
    // </div>
    <div className="signup-container">
      <div className="signup-box">
        <h2>SignUp</h2>
        <form onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Name"
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Register Number"
            onChange={(e) => setRegno(e.target.value)}
          />
          <input
            type="number"
            placeholder="Phone number"
            onChange={(e) => setNumber(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email id"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="error">{error}</p>}
          <button className="submit-btn" disabled={loading}>
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>
        <p className="toggle-link">
          Already have a account?
          <span className="link" onClick={() => navigate("/login")}>
            {" "}
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Signup;
