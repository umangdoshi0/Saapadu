const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const session = require('express-session');
const path = require("path");
require('dotenv').config();

// Initialize Express app
const app = express();

// Middleware
const corsOptions = {
    origin: 'http://localhost:3000', // React frontend
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

// MongoDB Connection
const URL = process.env.MONGO_URI;
mongoose.connect(URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1);
    });

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
        if (userExists) {
            return res.status(400).json({ error: 'Reg. No. already exists' });
        }

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
        if (!user) {
            return res.status(400).json({ error: 'Invalid Username' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid Password' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        req.session.regNo = regNo;

        return res.status(200).json({ message: 'Login successful', token });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
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

// Serve React Frontend
app.use(express.static(path.join(__dirname, "client/build")));

// Redirect all unknown routes to React index.html
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client/build", "index.js"));
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


// const express = require('express');
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const cors = require('cors');
// require('dotenv').config();
// const session = require('express-session');

// // Initialize Express app
// const app = express();


// // Middleware
// const corsOptions = {
//     // React frontend address
//     // origin: 'http://localhost:3000',
//     methods: ['GET', 'POST'],
//     credentials: true,
// };
// app.use(cors(corsOptions));


// // To parse JSON body
// app.use(express.json());
// app.use(session({
//     secret: process.env.SESSION_SECRET || 'your_session_secret',
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: false }
// }));
// const URL = process.env.MONGO_URI;

// // MongoDB connection
// mongoose.connect(URL, { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => console.log('Connected to MongoDB'))
//     .catch((err) => {
//         console.error('Error connecting to MongoDB:', err);
//         process.exit(1); // Exit process if MongoDB connection fails
//     });

// // MongoDB Login model
// const User = mongoose.model('logininfos', new mongoose.Schema({
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     number: { type: String, required: true, unique: true },
//     regNo: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
// }));


// // Route for user registration
// app.post('/register', async (req, res) => {
//     const { name, email, number, regNo, password } = req.body;

//     try {
//         // Check if the registration number already exists
//         const userExists = await User.findOne({ regNo });
//         if (userExists) {
//             return res.status(400).json({ error: 'Reg. No. already exists' });
//         }

//         // Hash the password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Create a new user
//         const newUser = new User({ name, email, number, regNo, password: hashedPassword });
//         await newUser.save();

//         return res.status(201).json({ message: 'User registered successfully' });
//     } catch (err) {
//         console.error(err);
//         return res.status(500).json({ error: 'Server error' });
//     }
// });

// // Route for user login
// app.post('/login', async (req, res) => {
//     const { regNo, password } = req.body;

//     try {
//         // Find the user by registration number
//         const user = await User.findOne({ regNo });
//         if (!user) {
//             return res.status(400).json({ error: 'Invalid Username' });
//         }

//         // Check if password matches
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(400).json({ error: 'Invalid Password' });
//         }

//         // Generate JWT token
//         const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
//         req.session.regNo = regNo;
//         return res.status(200).json({ message: 'Login successful', token });
//     } catch (err) {
//         console.error(err);
//         return res.status(500).json({ error: 'Server error' });
//     }
// });

// // MOngoDB fetch menu model
// const Menu = mongoose.model('fooditems', new mongoose.Schema({
//     name: String,
//     price: Number,
//     rating: Number,
//     reviews: Number,
//     description: String,
//     image: String
// }));

// // Route to fetch all food items in menu
// app.get('/api/items', async (req, res) => {
//     console.log("Fetching food items...");  // Add logging for debugging
//     try {
//         const items = await Menu.find();
//         res.json(items);
//     } catch (error) {
//         console.error("Error fetching data:", error);
//         res.status(500).send("Server Error");
//     }
// });


// // Start the Express server
// const PORT = process.env.PORT || 5000; // Use environment variable for port
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });

// const path = require("path");

// // Serve frontend build files
// app.use(express.static(path.join(__dirname, "client/build")));

// // Redirect all unknown routes to index.html
// app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "src/", "index.js"));
// });
