import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import session from 'express-session';
import path from "path";
import dotenv from 'dotenv';
import process from 'process';
import Razorpay from "razorpay";
import multer from 'multer';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

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
    cookie: { 
      secure: false,
      httpOnly: true,
      sameSite: 'lax'
     }
}));

// Configure multer for handling file uploads
const upload = multer({ dest: 'uploads/' }); // or use memoryStorage if you want to skip saving to disk


// AWS Configuration
AWS.config.update({
  region: 'ap-south-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

app.post("/api/checkout/send-email", async (req, res) => {
  if (!req.session.regNo) {
      return res.status(401).json({ error: "User not logged in" });
  }

  try {
      // Find the user using regNo stored in session
      const user = await User.findOne({ regNo: req.session.regNo });
      if (!user || !user.email) {
          return res.status(404).json({ error: "User or email not found" });
      }


      const { cartItems, totalBill } = req.body;

        // Format the order summary
        const orderDetails = cartItems.map(item => (
            `• ${item.name} x ${item.quantity} — ₹${item.price * item.quantity}`
        )).join('\n');

        const emailBody = `
Hi ${user.name},

Thank you for placing an order with us! 🎉

🧾 Order Summary:
${orderDetails}

💰 Total: ₹${totalBill}

We’ll get started on your order right away!

Best,
Café App Team
        `;

      // Prepare SES client
      const ses = new AWS.SES({ region: 'ap-south-1' });

      // Send the email
      const params = {
          Destination: {
              ToAddresses: [user.email],
          },
          Message: {
              Body: {
                  Text: {
                      Charset: "UTF-8",
                      Data: emailBody,
                      // Data: `Hello ${user.name},\n\nYour order has been placed successfully!\n\nThank you for shopping with us. 😄`,
                  },
              },
              Subject: {
                  Charset: 'UTF-8',
                  Data: 'Order Confirmation - Your Order is Placed!',
              },
          },
          Source: process.env.SES_VERIFIED_EMAIL, // must be verified in SES
      };

      await ses.sendEmail(params).promise();

      return res.status(200).json({ message: "Email sent successfully" });
  } catch (err) {
      console.error("SES error:", err);
      return res.status(500).json({ error: "Failed to send email" });
  }
});

const s3 = new AWS.S3();
const transcribeService = new AWS.TranscribeService();

// POST /transcribe endpoint
app.post('/transcribe', upload.single('audio'), async (req, res) => {
    try {
      const audioFilePath = req.file.path;
      const fileContent = fs.readFileSync(audioFilePath);
      const s3Key = `audio/${uuidv4()}.webm`;
  
      // Upload to S3
      await s3.putObject({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: s3Key,
        Body: fileContent,
        ContentType: 'audio/webm',
      }).promise();
  
      // Start Transcription Job
      const jobName = `job-${uuidv4()}`;
      const mediaUri = `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${s3Key}`;
  
      await transcribeService.startTranscriptionJob({
        TranscriptionJobName: jobName,
        LanguageCode: 'en-IN',
        Media: { MediaFileUri: mediaUri },
        MediaFormat: 'webm',
        OutputBucketName: process.env.AWS_S3_BUCKET,
      }).promise();
  
      // Poll the job status
      const waitForJob = async () => {
        return new Promise((resolve, reject) => {
          const interval = setInterval(async () => {
            const data = await transcribeService.getTranscriptionJob({ TranscriptionJobName: jobName }).promise();
            const status = data.TranscriptionJob.TranscriptionJobStatus;
            if (status === 'COMPLETED') {
              clearInterval(interval);
              const transcriptFileUri = data.TranscriptionJob.Transcript.TranscriptFileUri;
  
              // Fetch transcript from URL
              const transcriptRes = await fetch(transcriptFileUri);
              const transcriptJson = await transcriptRes.json();
              const transcribedText = transcriptJson.results.transcripts[0].transcript;
  
              resolve(transcribedText);
            } else if (status === 'FAILED') {
              clearInterval(interval);
              reject('Transcription failed');
            }
          }, 3000);
        });
      };
  
      const text = await waitForJob();
      res.json({ text });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Transcription failed' });
    } finally {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
    }
  });

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
        app.listen(PORT , '0.0.0.0', () => {
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
// const Cafes = mongoose.model('cafes', new mongoose.Schema({
//     name: String,
//     image: String,
//     category:[String]
// }));
// app.get('/api/cafes', async (req, res) => {
//     console.log("Fetching cafe...");
//     try {
//         const cafe = await Cafes.find();
//         res.json(cafe);
//     } catch (error) {
//         console.error("Error fetching data:", error);
//         res.status(500).send("Server Error");
//     }
// });


// MongoDB Menu Model
const Menu = mongoose.model('fooditems', new mongoose.Schema({
    name: String,
    price: Number,
    rating: Number,
    category : String,
    cafeId: String,
    reviews: Number,
    description: String,
    image: String
}));

// Fetch All Food Items Route
app.get('/api/items', async (req, res) => {
    
    try {
        // const {cafeId} = req.params;
        // console.log("Recieved cafeId :" , cafeId);
        console.log("Fetching food items...");

        const items = await Menu.find();

        // console.log("Fetched menu Items:" , items);
        res.json(items);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("Server Error");
    }
});

// get account details
app.get('/api/account', async (req, res) => {
    if (!req.session.regNo) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    
    try {
        const user = await User.findOne({ regNo: req.session.regNo });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Server error" });
    }
});




const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  
  // Define the payment route directly in `server.js`
  app.post("/api/payment/create-order", async (req, res) => {
    try {
      const { amount, currency } = req.body;
      const options = {
        amount: amount * 100, // Convert to paise
        currency,
        receipt: `receipt_${Date.now()}`,
      };
  
      const order = await razorpay.orders.create(options);
      res.json({ success: true, order });
    } catch (error) {
      res.status(500).json({ success: false, message: "Order creation failed", error });
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
