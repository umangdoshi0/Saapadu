import React from "react";
import "./Image.css";
import logo from '../../../../Assests/logo.png';

function Image() {
    return (
        <div className="size">
            <img src={logo} alt="LOGO" />
        </div>
    );
}
export default Image;