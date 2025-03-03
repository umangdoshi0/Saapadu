// Cart.jsx
import React from "react";
import "./Cart.css";
import Navbar from "../../Components/Navbar/Navbar";
import vegpizza from "../../Assets/vegpizza.png";
// import { FaUser } from "react-icons/fa";
// import { useNavigate } from 'react-router-dom';

const Cart = ({ cartItems, totalBill, removeFromCart, updateItemQuantity }) => {
  // const navigate = useNavigate();
  // const handleAccountClick = () => {
  //     navigate(`/account`);
  // };

  const handleCheckout = () => {
    alert("Order placed successfully!");
  };

  return (
    <>
      <Navbar />
      <div className="checkout-container">
        {/* <div className="checkout"> */}
          <div className="checkout-wrapper">
            <h2 className="checkout-title">Checkout</h2>
            {cartItems.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              cartItems.map((item) => (
                <div key={item._id} className="checkout-details">
                  <div className="restaurants-details">
                    <img
                      src={vegpizza}
                      alt={item.name}
                      style={{ width: "50px" }}
                    />
                    <h3 className="resto-name">Rest name</h3>
                  </div>
                  <div className="order-details">
                    <h3 className="item-name">{item.name}</h3>
                    <div className="Quantity-controls">
                      <button
                        className="Q-btn"
                        onClick={() =>
                          updateItemQuantity(item._id, item.quantity - 1)
                        }
                      >
                        -
                      </button>
                      <p className="Q-number">{item.quantity}</p>
                      <button
                        className="Q-btn"
                        onClick={() =>
                          updateItemQuantity(item._id, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                      {/* <button onClick={() => removeFromCart(item._id)}>Remove</button> */}
                    </div>
                    <p className="item-price"> ₹{item.price}</p>
                  </div>
                  <hr />
                  <div className="bill-details">
                    <h4 className="bill-heading">Bill Details</h4>
                    <div className="total-price">
                      <h3>Item Total</h3>
                      <h3>₹{totalBill}</h3>
                    </div>
                  </div>
                  <button
                      onClick={handleCheckout}
                      className="checkout-button">
                      Proceed to Payment
                    </button>
                </div>
              ))
            )}
          </div>
        {/* </div> */}
      </div>
    </>
  );
};

// const Cart = ({ cartItems, totalBill, removeFromCart, updateItemQuantity }) => {
//     const handleQuantityChange = (id, e) => {
//         const quantity = parseInt(e.target.value);
//         updateItemQuantity(id, quantity);
//     };
//     const navigate = useNavigate();
//     const handleAccountClick = () => {
//         navigate(`/account`);
//     };

//     const handleCheckout = () => {
//         alert('Order placed successfully!');
//     };

//     return (
//         <div className="checkout-wrapper">
//             <nav>
//                 <div className="navbar-logo">
//                     <h1>VIT Sapaadu</h1>
//                 </div>
//                 <div className="navbar-user">
//                     <button onClick={handleAccountClick} type="submit" className="user-button" name="user-button"><FaUser className="icon" />USER</button>
//                 </div>
//             </nav>
//             <div className="checkout-container">
//                 <h2 className="checkout-title">Checkout</h2>
//                 <ul style={{ listStyleType: 'none', padding: 0 }}>
//                     {cartItems.map((item) => (
//                         <li key={item.id} className="cart-item">
//                             <span>{item.name} x </span>
//                             <input
//                                 type="number"
//                                 value={item.quantity}
//                                 onChange={(e) => handleQuantityChange(item.id, e)}
//                                 min="1"
//                                 className="quantity-input"
//                             />
//                             <span> ₹{item.price * item.quantity}</span>
//                             <button onClick={() => removeFromCart(item.id)} className="remove-item-button">Remove</button>
//                         </li>
//                     ))}
//                 </ul>
//                 <hr />
//                 <div className="cart-summary">
//                     <h3>Cart Summary</h3>
//                     <p>Items: {cartItems.length}</p>
//                     <p>Total Bill: ₹{totalBill}</p>
//                 </div>
//                 <button onClick={handleCheckout} className="checkout-button">
//                     Proceed to Payment
//                 </button>
//             </div>
//         </div>
//     );
// };

export default Cart;
