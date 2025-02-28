import React from "react";
import "./Navbar.css";
// import Image from "./Logo/Image/Image";
// import Text from "./Logo/Text/Text";
import Logo from "../Navbar/Logo/Logo"

function Navbar() {
    return (
        <div className="navbar">
            <div className="navleft">
                {/* <Image />
                <Text /> */}
                <Logo />
                
            </div>
        </div>
    );
}
export default Navbar;