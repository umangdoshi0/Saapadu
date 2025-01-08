import React from "react";
import "./Navbar.css";
import Image from "./Logo/Image/Image";
import Text from "./Logo/Text/Text";

function Navbar() {
    return (
        <div className="navbar">
            <div className="navleft">
                <Image />
                <Text />
            </div>
        </div>
    );
}
export default Navbar;