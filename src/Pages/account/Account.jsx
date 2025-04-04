// import React, { useEffect, useState } from "react";
// import { useNavigate } from 'react-router-dom';
// import OrderHistory from './order-history/OrderHistory';
// // import Navbar from './Account-Components/navbar';
// import './Account.css';
// import axios from "axios";

// const Account = () => {
//     const [user, setUser] = useState(null);
//     const [error, setError] = useState('');
//     const navigate = useNavigate();

    // // Fetch user data from the backend when the component mounts
    // useEffect(() => {
    //     axios.get('http://localhost:5000/api/account', { withCredentials: true })
    //         .then(response => {
    //             setUser(response.data.user);  // Set user data
    //         })
    //         .catch(err => {
    //             setError(err.response?.data?.error || 'Something went wrong');
    //         });
    // }, []);


    // const handleLogout = () => {
    //     localStorage.removeItem('token'); // Remove JWT token from localStorage
    //     axios.post('http://localhost:5000/api/logout', {}, { withCredentials: true })
    //         .then(() => {
    //             navigate('/login');  // Redirect to login page after logout
    //         })
    //         .catch(err => {
    //             console.error('Error during logout:', err);
    //             navigate('/login');  // Redirect to login page even if logout fails
    //         });
    // };
    // if (error) {
    //     return <div className="error">{error}</div>;
    // }

    // if (!user) {
    //     return <div>Loading...</div>;  // Show loading message until user data is fetched
    // }

//     return (
//         <div className="account-wrapper">
//             {/* <Navbar /> */}
//             <div>
//                 <h1>My Account</h1>

//                 <button onClick={handleLogout}>Logout</button>
//             </div>
//             <div>
//                 <h2>Welcome {user.name}</h2>
//             </div>
//             <OrderHistory />
//         </div>
//     );
// };

// export default Account;

import React from "react";
import { useNavigate } from "react-router-dom";

const Account = () => {
const navigate = useNavigate();

  const handleLogout = () => {
    console.log("User logged out"); // Simulate logout
    navigate("/");
  };

  return (
    <div style={styles.container}>
      <h1>My Account</h1>
      <p><strong>Name:</strong> John Doe</p>
      <p><strong>Email:</strong> john.doe@example.com</p>
      <button onClick={handleLogout} style={styles.button}>Logout</button>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#ff4d4d",
    color: "white",
    border: "none",
    padding: "10px 20px",
    cursor: "pointer",
  },
};

export default Account;
