import React from "react";
import "./Footer.css";
import Logo from "../Navbar/Logo/Logo";
// import Text from "../Navbar/Logo/Text/Text";
// import Image from "../Navbar/Logo/Image/Image";
// import logo from "../../Assests/logo.png";

function Footer() {
  return (
    <>
      {/* <hr /> */}
      <footer className="footer">
          <div className="heading">
            {/* <img src={logo} alt="logo" style={{width:110}}/>
            <h3 style={{fontSize:20}}></h3> */}
            <Logo/>
            
          </div>
          <div className="section">
            <div className="footer-section">
              <h2>Company</h2>
              <p>
                <a href="#About Us">About Us</a>
              </p>
              <p>
                <a href="#Team">Team</a>
              </p>
            </div>
            <div className="footer-section">
              <h2>Contact Us</h2>
              <p>
                <a href="#Help & Support">Help & Support</a>
              </p>
            </div>
            <div className="footer-section">
              <h2>Available in:</h2>
              <p style={{fontSize:20}}>VIT Chennai</p>
            </div>
          </div>
        <hr style={{borderWidth:"2px",color:"#000"}}/>
      </footer>
    </>
  );
}

export default Footer;
