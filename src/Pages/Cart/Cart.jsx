// Cart.jsx
import React from "react";
import "./Cart.css";
import Navbar from "../../Components/Navbar/Navbar";
import vegpizza from "../../Assets/vegpizza.png";

const Cart = ({ cartItems, totalBill, removeFromCart, updateItemQuantity }) => {
    const handleCheckout = async () => {
        try {
            const res = await fetch("https://b7f4-2409-40f4-19-e795-6de0-7c5c-e1a0-23f7.ngrok-free.app/api/checkout/send-email", {   
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ cartItems, totalBill })
            });

            if (!res.ok) {
              const errorText = await res.text(); 
              console.error("Error Response:", errorText);
              alert("Order failed: " + res.status);
              return;
          }
          
          const data = await res.json();
          if (res.ok) {
            alert("Order placed successfully! A confirmation email has been sent.");
        } else {
            alert("Order placed, but failed to send confirmation email.");
            console.error(data);
        }
    } catch (err) {
        console.error("Checkout error:", err);
        alert("Something went wrong.");
    }
    };

    return (
        <>
            <Navbar />
            <div className="checkout-container">
                <div className="checkout-wrapper">
                    <h2 className="checkout-title">Checkout</h2>
                    <div className="restaurants-details">
                        <img src={vegpizza} alt="FOOD" style={{ width: "50px" }} />
                        <h3 className="resto-name">Gazebo</h3>
                    </div>
                    {cartItems.length === 0 ? (
                        <p>Your cart is empty.</p>
                    ) : (
                        <>
                            {cartItems.map((item) => (
                                <div key={item.foodId} className="checkout-details">
                                    <div className="order-details">
                                        <h3 className="item-name">{item.name}</h3>
                                        <div className="Quantity-controls">
                                            <button
                                                className="Q-btn"
                                                onClick={() => updateItemQuantity(item.foodId, item.quantity - 1)}  
                                            >
                                                -
                                            </button>
                                            <p className="Q-number">{item.quantity}</p>
                                            <button
                                                className="Q-btn"
                                                onClick={() => updateItemQuantity(item.foodId, item.quantity + 1)}
                                            >
                                                +
                                            </button>
                                            <button onClick={() => removeFromCart(item.foodId)}>Remove</button>
                                        </div>
                                        <p className="item-price"> ₹{item.price}</p>
                                    </div>
                                    <hr />
                                </div>
                            ))}

                            <div className="bill-details">
                                <h4 className="bill-heading">Bill Details</h4>
                                <div className="total-price">
                                    <h3>Item Total</h3>
                                    <h3>₹{totalBill}</h3>
                                </div>
                            </div>

                            <button onClick={handleCheckout} className="checkout-button">
                                Proceed to Payment
                            </button>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default Cart;


// const Cart = ({ cartItems, totalBill, removeFromCart, updateItemQuantity }) => {
//   const loadRazorpayScript = () => {
//     return new Promise((resolve) => {
//       const script = document.createElement("script");
//       script.src = "https://checkout.razorpay.com/v1/checkout.js";
//       script.onload = () => resolve(true);
//       script.onerror = () => resolve(false);
//       document.body.appendChild(script);
//     });
//   };
  
//   const handleCheckout = async () => {
//     try {
//       const scriptLoaded = await loadRazorpayScript();
//       if (!scriptLoaded) {
//         alert("Razorpay SDK failed to load. Make sure you are online.");
//         return;
//       }
  
//       const { data } = await axios.post("http://localhost:5000/api/payment/create-order", {
//         amount: totalBill,
//         currency: "INR",
//       });
  
//       const options = {
//         key: import.meta.env.VITE_RAZORPAY_KEY_ID, // ✅ Use Vite-compatible environment variable
//         amount: data.order.amount,
//         currency: data.order.currency,
//         order_id: data.order.id,
//         name: "Demo Payment",
//         description: "Test Transaction",
//         handler: function (response) {
//           alert("Payment Successful! Payment ID: " + response.razorpay_payment_id);
//         },
//         prefill: {
//           name: "John Doe",
//           email: "johndoe@example.com",
//           contact: "9999999999",
//         },
//         theme: {
//           color: "#F37254",
//         },
//       };
  
//       const rzp = new window.Razorpay(options); // ✅ Ensure Razorpay is loaded before calling this
//       rzp.open();
//     } catch (error) {
//       console.error("Payment Error:", error);
//       alert("Payment failed!");
//     }
//   };
// return (

// );
// }
