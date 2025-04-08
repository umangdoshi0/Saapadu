import React from "react";
import "./Navbar.css";
// import Image from "./Logo/Image/Image";
// import Text from "./Logo/Text/Text";
import Logo from "../Navbar/Logo/Logo"
import { Link } from "react-router-dom";
import { IoCart } from "react-icons/io5";
import { FaUser } from "react-icons/fa";

function Navbar() {
    return (
        <div className="navbar">
            <div className="navleft">
                {/* <Image />
                <Text /> */}
                <Logo />
                
            </div>
            <div className="navright">
                <Link to="/cart"><IoCart className="cart-icon"/></Link>
                <Link to ="/account"><FaUser className="acct-icon"/></Link>
            </div>
        </div>
    );
}
export default Navbar;