import React from "react";
// import mainlogo from '../../assets/logo.png';
import './Footer.css';
function Footer() {
    return (
        <section>
            <hr />
            <footer className="footer">
                <div>
                    {/* <div>
                        <img src={mainlogo} alt="LOGO" className='navlogo' />
                    </div> */}
                    <div>
                        <h3 style={{ fontWeight: "bolder" }}>VIT Sapaadu</h3>
                    </div>
                    <div>
                        <p>2024 Limited</p>
                    </div>
                </div>
                <div className="footer-section">
                    <h2>Company</h2>
                </div>
                <div className="footer-section">
                    <p><a href="#About Us">About Us</a></p>
                </div>
                <div className="footer-section">
                    <p><a href="#Team">Team</a></p>
                </div>
                <div className="footer-section">
                    <h2>Contact Us</h2>
                </div>
                <div className="footer-section">
                    <p><a href='#Help & Support'>Help & Support</a></p>
                </div>
                <div className="footer-section">
                    <h2>Legal</h2>
                </div>
                <div className="footer-section">
                    <p><a href="#Terms & Conditions">Terms & Conditions</a></p>
                </div>
                <div className="footer-section">
                    <p><a href="#Privacy Policy">Privacy Policy</a></p>
                </div>
                <div className="footer-section">
                    <h2>Available in:</h2>
                </div>
                <div className="footer-section">
                    <p>VIT Chennai</p>
                </div>
            </footer>
        </section>
    );
}

export default Footer;