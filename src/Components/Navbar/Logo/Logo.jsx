import React from "react";
import logo from '../../../Assets/logo.png';
import "./Logo.css"
import { Navigate } from "react-router-dom";

function Logo() {
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
      <div className="logo-container" onClick={()=> Navigate("/home")}>
      <div className="logo"><img src={logo} alt="LOGO" /></div>
      <div className="text"><h2>VIT SAPAADU</h2></div> 
      </div>
    </>
  );
}
export default Logo;
