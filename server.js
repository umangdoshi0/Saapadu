import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import session from 'express-session';
import path from "path";
import dotenv from 'dotenv';
import process from 'process';


// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// CORS Middleware
const corsOptions = {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_session_secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Start Server
const startServer = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error("Missing MongoDB connection string!");
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1);
    }
};
startServer();

// MongoDB User Model
const User = mongoose.model('logininfos', new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    number: { type: String, required: true, unique: true },
    regNo: { type: String, required: true, unique: true },
    password: { type: String, required: true },
}));

// User Registration Route
app.post('/register', async (req, res) => {
    const { name, email, number, regNo, password } = req.body;
    try {
        const userExists = await User.findOne({ regNo });
        if (userExists) return res.status(400).json({ error: 'Reg. No. already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, number, regNo, password: hashedPassword });
        await newUser.save();

        return res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
});

// User Login Route
app.post('/login', async (req, res) => {
    const { regNo, password } = req.body;
    try {
        const user = await User.findOne({ regNo });
        if (!user) return res.status(400).json({ error: 'Invalid Username' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid Password' });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        req.session.regNo = regNo;

        return res.status(200).json({ message: 'Login successful', token });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
});

// MongoDB Cafe Model
const Cafes = mongoose.model('cafes', new mongoose.Schema({
    name: String,
    image: String,
    category:[String]
}));
app.get('/api/cafes', async (req, res) => {
    console.log("Fetching cafe...");
    try {
        const cafe = await Cafes.find();
        res.json(cafe);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("Server Error");
    }
});


// MongoDB Menu Model
const Menu = mongoose.model('fooditems', new mongoose.Schema({
    name: String,
    price: Number,
    rating: Number,
    reviews: Number,
    description: String,
    image: String
}));

// Fetch All Food Items Route
app.get('/api/items', async (req, res) => {
    console.log("Fetching food items...");
    try {
        const items = await Menu.find();
        res.json(items);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("Server Error");
    }
});

// Serve Vite React Frontend
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
});




// const express = require('express');
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const cors = require('cors');
// const session = require('express-session');
// const path = require("path");
// require('dotenv').config();

// // Initialize Express app
// const app = express();

// // Middleware
// const corsOptions = {
//     origin: 'http://localhost:3000', // React frontend
//     methods: ['GET', 'POST'],
//     credentials: true,
// };
// app.use(cors(corsOptions));
// app.use(express.json());
// app.use(session({
//     secret: process.env.SESSION_SECRET || 'your_session_secret',
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: false }
// }));
// const startServer = async () => {
//     try {
//         // MongoDB Connection
//         const URL = process.env.MONGO_URI;
//         await mongoose.connect(URL, { useNewUrlParser: true, useUnifiedTopology: true });
//         console.log('Connected to MongoDB');
//         // Start Server
//         const PORT = process.env.PORT || 5000;
//         app.listen(PORT, () => {
//             console.log(`Server is running on port ${PORT}`);
//         });
//     } catch (err) {
//         console.error('Error connecting to MongoDB:', err);
//         process.exit(1);
//     }
// };
// startServer();

// // MongoDB User Model
// const User = mongoose.model('logininfos', new mongoose.Schema({
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     number: { type: String, required: true, unique: true },
//     regNo: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
// }));

// // User Registration Route
// app.post('/register', async (req, res) => {
//     const { name, email, number, regNo, password } = req.body;
//     try {
//         const userExists = await User.findOne({ regNo });
//         if (userExists) {
//             return res.status(400).json({ error: 'Reg. No. already exists' });
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);
//         const newUser = new User({ name, email, number, regNo, password: hashedPassword });
//         await newUser.save();

//         return res.status(201).json({ message: 'User registered successfully' });
//     } catch (err) {
//         console.error(err);
//         return res.status(500).json({ error: 'Server error' });
//     }
// });

// // User Login Route
// app.post('/login', async (req, res) => {
//     const { regNo, password } = req.body;
//     try {
//         const user = await User.findOne({ regNo });
//         if (!user) {
//             return res.status(400).json({ error: 'Invalid Username' });
//         }

//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(400).json({ error: 'Invalid Password' });
//         }

//         const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
//         req.session.regNo = regNo;

//         return res.status(200).json({ message: 'Login successful', token });
//     } catch (err) {
//         console.error(err);
//         return res.status(500).json({ error: 'Server error' });
//     }
// });

// // MongoDB Menu Model
// const Menu = mongoose.model('fooditems', new mongoose.Schema({
//     name: String,
//     price: Number,
//     rating: Number,
//     reviews: Number,
//     description: String,
//     image: String
// }));

// // Fetch All Food Items Route
// app.get('/api/items', async (req, res) => {
//     console.log("Fetching food items...");
//     try {
//         const items = await Menu.find();
//         res.json(items);
//     } catch (error) {
//         console.error("Error fetching data:", error);
//         res.status(500).send("Server Error");
//     }
// });

// // // Serve React Frontend
// // app.use(express.static(path.join(__dirname, "build")));

// // // Redirect all unknown routes to React index.html
// // app.get("*", (req, res) => {
// //     res.sendFile(path.join(__dirname, "build", "index.html"));
// // });

// // app.use(express.static(path.join(__dirname, "sapaadu/dist")));

// // app.get("*", (req, res) => {
// //     res.sendFile(path.join(__dirname, "sapaadu/dist", "index.html"));
// // });
