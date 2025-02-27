import React from "react";
import logo from '../../../Assets/logo.png';
import "./Logo.css"

function Logo() {
  return (
    <>
    <a href="/home">
      <div className="size">
        <img src={logo} alt="LOGO" />
      </div>
      </a>
    </>
  );
}
export default Logo;
