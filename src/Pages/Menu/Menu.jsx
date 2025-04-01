import React, { useState, useEffect } from "react";
import { useNavigate ,useParams} from "react-router-dom";
import axios from "axios";
import "./Menu.css";
import Navbar from "../../Components/Navbar/Navbar";
import vegpizza from "../../Assets/vegpizza.png";

const Menu = ({ addToCart }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantities, setQuantities] = useState({});
    const navigate = useNavigate();
    const {cafeId} = useParams(); //get menuItems

    useEffect(() => {
        // Fetch food items from the backend API
        fetch(`http://localhost:5000/api/items/${cafeId}`)
            .then((response) =>response.json())
               .then((data) =>{
                console.log("Fetched Menu Data:" ,data);
                setItems(data);
                setLoading(false);
               })
            .catch((err) => {
                console.error("Error fetching data:", err);
                setError("Error fetching data. Please check the backend.");
                setLoading(false);
            });
    }, [cafeId]);

    // Handle the decrease in quantity
    const decreaseQuantity = (id) => {
        setQuantities((prev) => ({
            ...prev,
            [id]: Math.max((prev[id] || 1) - 1, 0),
        }));
    };
    const increaseQuantity = (id) => {
        setQuantities((prev) => ({
            ...prev,
            [id]: (prev[id] || 0) + 1,
        }));
    };

    // Handle the add item to cart logic
    const handleAddToCart = (item) => {
        const quantity = quantities[item._id] || 1; // Default to 1 if quantity is not set
        addToCart({ ...item, quantity });
        setQuantities((prev) => ({
            ...prev,
            [item._id]: quantity,
        }));
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <Navbar />
            <div className="food-menu">
                <h2>Food Menu</h2>
                <div className="menu-items">
                    {items.map((item) => (
                        <div className="menu-item-card" key={item._id}>
                            <div className="item-details">
                                <h3 className="item-name">{item.name}</h3>
                                <p className="price">₹{item.price}</p>
                                <p className="rating">⭐ {item.rating} ({item.reviews})</p>
                                <p className="description">{item.description}</p>
                            </div>
                            <div className="item-image">
                                <img src={vegpizza} alt={item.name} className="food-img" />
                                <div className="quantity-controls">
                                    {quantities[item._id] > 0 ? (
                                        <>
                                            <div className="btn-controls">
                                                <button className="Q-btn" onClick={() => decreaseQuantity(item._id)}>-</button>
                                                <span className="Q-number"> {quantities[item._id]}</span>
                                                <button className="Q-btn" onClick={() => increaseQuantity(item._id)}>+</button>
                                            </div>
                                        </>
                                    ) : (
                                        <button className="add-to-cart" onClick={() => handleAddToCart(item)}>ADD</button>
                                    )}

                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <button onClick={() => navigate("/cart")} className="go-to-cart-button">
                    Go to Cart
                </button>
            </div>
        </div>
    );
};

export default Menu;
