import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Menu.css";
import Navbar from "../../Components/Navbar/Navbar";
import vegpizza from "../../Assets/vegpizza.png";

const Menu = ({ addToCart }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantities, setQuantities] = useState({});
    const navigate = useNavigate();
    const { cafeId } = useParams();

    useEffect(() => {
        fetch("https://b7f4-2409-40f4-19-e795-6de0-7c5c-e1a0-23f7.ngrok-free.app/api/items", { credentials: 'include' })  // Dynamic URL for deployment
            .then((response) => response.json())
            .then((data) => {
                setItems(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching data:", err);
                setError("Error fetching data. Please check the backend.");
                setLoading(false);
            });
    }, [cafeId]);

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

    const handleAddToCart = (item) => {
        const quantity = quantities[item.foodId] || 1;
        addToCart({ ...item, quantity });
        setQuantities((prev) => ({
            ...prev,
            [item.foodId]: quantity,
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
                        <div className="menu-item-card" key={item.foodId}>
                            <div className="item-details">
                                <h3 className="item-name">{item.name}</h3>
                                <p className="price">₹{item.price}</p>
                                <p className="rating">⭐ {item.rating} ({item.reviews})</p>
                                <p className="description">{item.description}</p>
                            </div>
                            <div className="item-image">
                                <img src={vegpizza} alt={item.name} className="food-img" />
                                <div className="quantity-controls">
                                    {quantities[item.foodId] > 0 ? (
                                        <div className="btn-controls">
                                            <button className="Q-btn" onClick={() => decreaseQuantity(item.foodId)}>-</button>
                                            <span className="Q-number">{quantities[item.foodId]}</span>
                                            <button className="Q-btn" onClick={() => increaseQuantity(item.foodId)}>+</button>
                                        </div>
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
