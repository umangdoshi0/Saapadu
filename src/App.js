import React from "react";
// import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
// import Login from './Pages/Login/Login';
// import SignUp from "./Pages/Login/SignUp";
import Home from './Pages/Homepage/Homepage';



function App() {
  return (
    <div className="cont">
      <Home />

      {/* <BrowserRouter>
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/home" element={<Home />} />
        <Route path="*" element={<Navigate to="/login" />} />

        </Routes>
      </BrowserRouter> */}
    </div>
  );
}

export default App;
