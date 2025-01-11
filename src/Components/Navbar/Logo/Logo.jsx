import React from "react";
import logo from '../../../Assests/logo.png';
import "./Logo.css"
import { useNavigate } from "react-router-dom";

function Logo() {
  const navigate = useNavigate();
  return (
    <>
      <div className="logo" onClick={() => navigate("/home")}>
        <div className="size">
          <img src={logo} alt="LOGO" />
        </div>
        <div className="text">
          <h2>VIT SAPAADU</h2>
        </div>
      </div>
    </>
  );
}
export default Logo;
