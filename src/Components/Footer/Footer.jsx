import React from "react";
import "./Footer.css";

function Footer() {
  return (
    <>
        {/* <hr /> */}
      <footer className="footer">
    <div className="section">
      <div className="heading">
       <h3>VIT Sapaadu</h3>
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
            <p>VIT Chennai</p>
          </div>
        </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;
