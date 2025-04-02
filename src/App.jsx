import React, { useState } from "react";
import { BrowserRouter, Route, Routes, Navigate ,useParams} from "react-router-dom";
import Login from './Pages/Login/Login';
import SignUp from "./Pages/Login/SignUp";
import Home from "./Pages/Homepage/Homepage";
import Menu from "./Pages/Menu/Menu";
import Cart from "./Pages/Cart/Cart";
import Account from "./Pages/account/Account";

function App() {
  const [cartItems, setCartItems] = useState([]); // Cart items state
  const [totalBill, setTotalBill] = useState(0); // Total bill state

  // Function to add item to cart and update total bill

  const addToCart = (item) => {
    const existingItemIndex = cartItems.findIndex(
      (cartItem) => cartItem._id === item._id
    );

    if (existingItemIndex !== -1) {
      // If the item is found in the cart, update its quantity
      const updatedCart = [...cartItems];
      updatedCart[existingItemIndex] = {
        ...updatedCart[existingItemIndex],
        quantity: updatedCart[existingItemIndex].quantity + 1,
      };
      setCartItems(updatedCart); // Update the cart state
    } else {
      // If the item is not found, add it with quantity 1
      setCartItems([...cartItems, { ...item, quantity: 1 }]);
    }
    setTotalBill((prevTotal) => prevTotal + item.price);
  };

  // Function to remove item from cart
  const removeFromCart = (id) => {
    const updatedCart = cartItems.filter((item) => item._id !== id);
    setCartItems(updatedCart);
    calculateTotal(updatedCart); // Recalculate the total after removing
  };

  // Function to update item quantity in the cart

  const updateItemQuantity = (id, quantity) => {
    if (quantity < 1) return;
    const updatedCart = cartItems.map((item) =>
      item._id === id ? { ...item, quantity } : item
    );
    setCartItems(updatedCart);
    calculateTotal(updatedCart); // Recalculate the total after updating quantity
  };


  const calculateTotal = (items) => {
    const newTotal = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    setTotalBill(newTotal);
  };

  return (
    <div className="cont">
      {/* <Home /> */}

      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/home" element={<Home />} />
          <Route path="/account" element={<Account />} />
          <Route path="/menu" element={<Menu addToCart={addToCart} cartItems={cartItems}/>} />
          <Route
            path="/cart"
            element={
              <Cart
                cartItems={cartItems}
                totalBill={totalBill}
                removeFromCart={removeFromCart}
                updateItemQuantity={updateItemQuantity}
              />
            }
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
