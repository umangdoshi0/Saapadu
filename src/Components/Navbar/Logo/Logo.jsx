import React from "react";
import logo from '../../../Assets/logo.png';
import "./Logo.css"
import { useNavigate } from "react-router-dom";

function Logo() {

  const navigate = useNavigate();

  return (
    <>
    {/* <a href="/home">
      <div className="size">
        <img src={logo} alt="LOGO" />
      </div>
      <div className="text">
        <h2>VIT SAPAADU</h2>
      </div>
      </a> */}
      <div className="logo-container" onClick={()=> navigate("/home")}>
      <div className="logo"><img src={logo} alt="LOGO" /></div>
      <div className="text"><h2>VIT SAPAADU</h2></div> 
      </div>
    </>
  );
}
export default Logo;
