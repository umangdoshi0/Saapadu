import React, { useState, useEffect, useRef } from "react";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import "./Homepage.css";
import { useNavigate } from "react-router-dom";
import northsquare from "../../Assets/northsquare.jpeg";
import aavin from "../../Assets/aavin.png";
import gazebo from "../../Assets/gazebo1.png";
import lassihouse from "../../Assets/lassihouse.png";

function Homepage() {
  const cafesRef = useRef(null);
  const navigate = useNavigate();
  const [cafes, setCafes] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/cafes")
      .then((response) => response.json())
      .then((data) => setCafes(data))
      .catch((error) => console.error("Error fetching cafes:", error));
  }, []);

  const scrollLeft = () => {
    if (cafesRef.current) {
      cafesRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (cafesRef.current) {
      cafesRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  // Handle cafe click to navigate to the Menu page
  const handleCafeClick = () => {
    navigate(`/menu`); // Programmatically navigate to the '/menu' page
  };
  return (
    <>
      <Navbar />
      <div className="cafes-list">
        <h1>Top Restaurants</h1>
        <div className="cafes-cont-wrapper">
          <button className="arrow left" onClick={scrollLeft}>
            &#9664;
          </button>
          <div className="cafes-cont" ref={cafesRef}>
            {/* Cafe 1 */}
            <div className="cafe1" onClick={handleCafeClick}>
              {/* <div className="cafe1"> */}
              <img className="cafe1-img" src={northsquare} alt="North Square" />
              <div className="cafe1-det">
                <h2>North Square</h2>
                <p>North Indian | Chinese | Fast Food</p>
              </div>
            </div>

            {/* Cafe 2 */}
            <div className="cafe1">
              <img className="cafe1-img" src={gazebo} alt="Another Cafe" />
              <div className="cafe1-det">
                <h2>Gazibo-1</h2>
                <p>Italian | Continental | Desserts</p>
              </div>
            </div>

            {/* Cafe 3 */}
            <div className="cafe1">
              <img className="cafe1-img" src={gazebo} alt="Cafe 3" />
              <div className="cafe1-det">
                <h2>Gazibo-2</h2>
                <p>Mexican | Fast Food</p>
              </div>
            </div>

            {/* Cafe 4 */}
            <div className="cafe1">
              <img className="cafe1-img" src={lassihouse} alt="Cafe 4" />
              <div className="cafe1-det">
                <h2>Lassi House</h2>
                <p>Chinese | Thai | Fast Food</p>
              </div>
            </div>

            {/* Cafe 5 */}
            <div className="cafe1">
              <img className="cafe1-img" src={aavin} alt="Cafe 5" />
              <div className="cafe1-det">
                <h2>Aavin Parlour</h2>
                <p>Milkshakes | Milk | Ice Cream</p>
              </div>
            </div>

            {/* Cafe 6 */}
            <div className="cafe1">
              <img className="cafe1-img" src={gazebo} alt="Cafe 6" />
              <div className="cafe1-det">
                <h2>Dakshin</h2>
                <p>Continental | American | Fast Food</p>
              </div>
            </div>

            {/* Cafe 7 */}
            <div className="cafe1">
              <img className="cafe1-img" src={northsquare} alt="Cafe 7" />
              <div className="cafe1-det">
                <h2>North Square-II</h2>
                <p>Japanese | Sushi | Fast Food</p>
              </div>
            </div>

            {/* Cafe 8 */}
            <div className="cafe1">
              <img className="cafe1-img" src={northsquare} alt="Cafe 8" />
              <div className="cafe1-det">
                <h2>North Square-III</h2>
                <p>Cool Drinks | Fresh Juice | Waffles </p>
              </div>
            </div>
          </div>
          <button className="arrow right" onClick={scrollRight}>
            &#9654;
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Homepage;
