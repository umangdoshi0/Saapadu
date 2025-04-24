// TOP IMPORTS
import express from 'express';
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
import { fileURLToPath } from 'url';
import fetch from 'node-fetch'; // needed if using Node <18

// ENV SETUP
dotenv.config();

// EXPRESS APP
const app = express();
app.use(express.json()); // Important for req.body parsing
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'https://main.d2a9klq1sm1sr7.amplifyapp.com'],
  methods: ['GET', 'POST'],
  credentials: true,
}));
app.set('trust proxy', 1);
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_session_secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: true,
    httpOnly: true,
    sameSite: 'None'
  }
}));

// STATIC FILES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "dist")));
app.use(express.static('public', {
  setHeaders: function (res, path) {
    if (path.endsWith('.js')) {
      res.set('Content-Type', 'application/javascript');
    }
  }
}));

// MULTER FOR FILE UPLOAD
const upload = multer({ dest: 'uploads/' });

// AWS SETUP
AWS.config.update({
  region: 'ap-south-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
const ses = new AWS.SES({ region: "ap-south-1" });
const s3 = new AWS.S3();
const transcribeService = new AWS.TranscribeService();
const dynamoDBClient = new AWS.DynamoDB.DocumentClient({
  region: "ap-south-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_USER2,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_USER2,
});

// ===== ROUTES BELOW THIS LINE =====

// REGISTER
app.post("/api/register", async (req, res) => {
  const { name, email, number, regNo, password } = req.body;
  try {
    const params = {
      TableName: "LoginInfos",
      FilterExpression: "regNo = :reg",
      ExpressionAttributeValues: { ":reg": regNo }
    };
    const data = await dynamoDBClient.scan(params).promise();
    if (data.Items.length > 0) return res.status(400).json({ error: 'Reg. No. already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    await dynamoDBClient.put({
      TableName: "LoginInfos",
      Item: { userId, name, email, number, regNo, password: hashedPassword }
    }).promise();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// LOGIN
app.post("/api/login", async (req, res) => {
  const { regNo, password } = req.body;
  try {
    const params = {
      TableName: "LoginInfos",
      FilterExpression: "regNo = :reg",
      ExpressionAttributeValues: { ":reg": regNo }
    };
    const data = await dynamoDBClient.scan(params).promise();
    if (data.Items.length === 0) return res.status(400).json({ error: 'Invalid Username' });

    const user = data.Items[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid Password' });

    const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    req.session.regNo = regNo;
    res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// CHECKOUT EMAIL
app.post("/api/checkout/send-email", async (req, res) => {
  if (!req.session.regNo) return res.status(401).json({ error: "User not logged in" });

  try {
    const params = {
      TableName: "LoginInfos",
      FilterExpression: "regNo = :reg",
      ExpressionAttributeValues: { ":reg": req.session.regNo }
    };
    const data = await dynamoDBClient.scan(params).promise();
    const user = data.Items[0];

    if (!user?.email) return res.status(404).json({ error: "User or email not found" });

    const { cartItems, totalBill } = req.body;
    const orderDetails = cartItems.map(item => `• ${item.name} x ${item.quantity} — ₹${item.price * item.quantity}`).join('\n');

    const emailBody = `Hi ${user.name},\n\nThank you for your order!\n\n🧾 Order Summary:\n${orderDetails}\n\n💰 Total: ₹${totalBill}\n\nBest,\nCafé App Team`;

    await ses.sendEmail({
      Destination: { ToAddresses: [user.email] },
      Message: {
        Body: { Text: { Charset: "UTF-8", Data: emailBody } },
        Subject: { Charset: "UTF-8", Data: "Order Confirmation" }
      },
      Source: process.env.SES_VERIFIED_EMAIL
    }).promise();

    res.status(200).json({ message: "Email sent successfully" });
  } catch (err) {
    console.error("SES error:", err);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// TRANSCRIBE AUDIO
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    const audioFilePath = req.file.path;
    const fileContent = fs.readFileSync(audioFilePath);
    const s3Key = `audio/${uuidv4()}.webm`;

    await s3.putObject({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: s3Key,
      Body: fileContent,
      ContentType: 'audio/webm',
    }).promise();

    const jobName = `job-${uuidv4()}`;
    const mediaUri = `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${s3Key}`;

    await transcribeService.startTranscriptionJob({
      TranscriptionJobName: jobName,
      LanguageCode: 'en-IN',
      Media: { MediaFileUri: mediaUri },
      MediaFormat: 'webm',
      OutputBucketName: process.env.AWS_S3_BUCKET,
    }).promise();

    const waitForJob = async () => {
      return new Promise((resolve, reject) => {
        const interval = setInterval(async () => {
          const data = await transcribeService.getTranscriptionJob({ TranscriptionJobName: jobName }).promise();
          const status = data.TranscriptionJob.TranscriptionJobStatus;
          if (status === 'COMPLETED') {
            clearInterval(interval);
            const transcriptRes = await fetch(data.TranscriptionJob.Transcript.TranscriptFileUri);
            const transcriptJson = await transcriptRes.json();
            resolve(transcriptJson.results.transcripts[0].transcript);
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
    fs.unlinkSync(req.file.path);
  }
});

// CAFES
app.get('/api/cafes', async (req, res) => {
  try {
    const data = await dynamoDBClient.scan({ TableName: "Cafes" }).promise();
    res.json(data.Items);
  } catch (err) {
    res.status(500).send("Server Error",err);
  }
});

// FOOD ITEMS
app.get('/api/items', async (req, res) => {
  try {
    const data = await dynamoDBClient.scan({ TableName: "FoodItems" }).promise();
    res.json(data.Items);
  } catch (err) {
    res.status(500).send("Server Error",err);
  }
});

// PAYMENT ORDER
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
app.post("/api/payment/create-order", async (req, res) => {
  try {
    const { amount, currency } = req.body;
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency,
      receipt: `receipt_${Date.now()}`
    });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Order creation failed", error });
  }
});

// FRONTEND FALLBACK
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// START SERVER
const startServer = () => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
startServer();


// import express from 'express';
// // import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import cors from 'cors';
// import session from 'express-session';
// import path from "path";
// import dotenv from 'dotenv';
// import process from 'process';
// import Razorpay from "razorpay";
// import multer from 'multer';
// import AWS from 'aws-sdk';
// import { v4 as uuidv4 } from 'uuid';
// import fs from 'fs';

// // Load environment variables
// dotenv.config();

// // Create Express app
// const app = express();

// // CORS Middleware
// const corsOptions = {
//     origin: ['http://localhost:5173', 'http://localhost:3000','https://main.d2a9klq1sm1sr7.amplifyapp.com'],
//     methods: ['GET', 'POST'],
//     credentials: true,
// };
// app.use(cors(corsOptions));
// app.use(express.static('public', { 
//   setHeaders: function (res, path) {
//     if (path.endsWith('.js')) {
//       res.set('Content-Type', 'application/javascript');
//     }
//   }
// }));
// app.set('trust proxy', 1);
// app.use(session({
//     secret: process.env.SESSION_SECRET || 'your_session_secret',
//     resave: false,
//     saveUninitialized: true,
//     cookie: { 
//       secure: true,
//       httpOnly: true,
//       sameSite: 'None'
//      }
// }));

// // Configure multer for handling file uploads
// const upload = multer({ dest: 'uploads/' }); // or use memoryStorage if you want to skip saving to disk

// const ses = new AWS.SES({ region: "ap-south-1" });

// // AWS Configuration
// AWS.config.update({
//   region: 'ap-south-1',
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
// });

// // ===== Dedicated DynamoDB Client with Separate IAM User =====
// const dynamoDBClient = new AWS.DynamoDB.DocumentClient({
//   region: "ap-south-1",
//   KeyId: process.env.AWS_ACCESS_KEY_USER2,
//   AccessKey: process.env.AWS_SECRET_ACCESS_KEY_USER2
// });

// app.post("/api/checkout/send-email", async (req, res) => {
//   if (!req.session.regNo) return res.status(401).json({ error: "User not logged in" });

//   try {
//     const params = {
//       TableName: "LoginInfos",
//       FilterExpression: "regNo = :reg",
//       ExpressionAttributeValues: { ":reg": req.session.regNo }
//     };
//     const data = await dynamoDBClient.scan(params).promise();
//     const user = data.Items[0];

//     if (!user || !user.email) return res.status(404).json({ error: "User or email not found" });


//       const { cartItems, totalBill } = req.body;

//         // Format the order summary
//         const orderDetails = cartItems.map(item => (
//             `• ${item.name} x ${item.quantity} — ₹${item.price * item.quantity}`
//         )).join('\n');

//         const emailBody = `
// Hi ${user.name},

// Thank you for placing an order with us! 🎉

// 🧾 Order Summary:
// ${orderDetails}

// 💰 Total: ₹${totalBill}

// We’ll get started on your order right away!

// Best,
// Café App Team
//         `;

//         await ses.sendEmail({
//           Destination: { ToAddresses: [user.email] },
//           Message: {
//             Body: { Text: { Charset: "UTF-8", Data: emailBody } },
//             Subject: { Charset: "UTF-8", Data: "Order Confirmation" }
//           },
//           Source: process.env.SES_VERIFIED_EMAIL
//         }).promise();

//       return res.status(200).json({ message: "Email sent successfully" });
//   } catch (err) {
//       console.error("SES error:", err);
//       return res.status(500).json({ error: "Failed to send email" });
//   }
// });

// const s3 = new AWS.S3();
// const transcribeService = new AWS.TranscribeService();

// // POST /transcribe endpoint
// app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
//     try {
//       const audioFilePath = req.file.path;
//       const fileContent = fs.readFileSync(audioFilePath);
//       const s3Key = `audio/${uuidv4()}.webm`;
  
//       // Upload to S3
//       await s3.putObject({
//         Bucket: process.env.AWS_S3_BUCKET,
//         Key: s3Key,
//         Body: fileContent,
//         ContentType: 'audio/webm',
//       }).promise();
  
//       // Start Transcription Job
//       const jobName = `job-${uuidv4()}`;
//       const mediaUri = `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${s3Key}`;
  
//       await transcribeService.startTranscriptionJob({
//         TranscriptionJobName: jobName,
//         LanguageCode: 'en-IN',
//         Media: { MediaFileUri: mediaUri },
//         MediaFormat: 'webm',
//         OutputBucketName: process.env.AWS_S3_BUCKET,
//       }).promise();
  
//       // Poll the job status
//       const waitForJob = async () => {
//         return new Promise((resolve, reject) => {
//           const interval = setInterval(async () => {
//             const data = await transcribeService.getTranscriptionJob({ TranscriptionJobName: jobName }).promise();
//             const status = data.TranscriptionJob.TranscriptionJobStatus;
//             if (status === 'COMPLETED') {
//               clearInterval(interval);
//               const transcriptFileUri = data.TranscriptionJob.Transcript.TranscriptFileUri;
  
//               // Fetch transcript from URL
//               const transcriptRes = await fetch(transcriptFileUri);
//               const transcriptJson = await transcriptRes.json();
//               const transcribedText = transcriptJson.results.transcripts[0].transcript;
  
//               resolve(transcribedText);
//             } else if (status === 'FAILED') {
//               clearInterval(interval);
//               reject('Transcription failed');
//             }
//           }, 3000);
//         });
//       };
  
//       const text = await waitForJob();
//       res.json({ text });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: 'Transcription failed' });
//     } finally {
//       // Clean up uploaded file
//       fs.unlinkSync(req.file.path);
//     }
//   });

// // Start Server
// const startServer = async () => {
//     try {
//         const PORT = process.env.PORT || 5000;
//         app.listen(PORT , '0.0.0.0', () => {
//             console.log(`Server is running on port ${PORT}`);
//         });
//     } catch (err) {
//         console.error('Connection Error', err);
//         process.exit(1);
//     }
// };
// startServer();

// // ===== User Registration =====
// app.post("/api/register", async (req, res) => {
//   const { name, email, number, regNo, password } = req.body;
//   try {
//     const params = {
//       TableName: "LoginInfos",
//       FilterExpression: "regNo = :reg",
//       ExpressionAttributeValues: { ":reg": regNo }
//     };

//     const data = await dynamoDBClient.scan(params).promise();
//     if (data.Items.length > 0) return res.status(400).json({ error: 'Reg. No. already exists' });

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const userId = uuidv4();

//     await dynamoDBClient.put({
//       TableName: "LoginInfos",
//       Item: { userId, name, email, number, regNo, password: hashedPassword }
//     }).promise();

//     res.status(201).json({ message: 'User registered successfully' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error'});
// }
// });

// // User Login Route
// // ===== User Login =====
// app.post("/api/login", async (req, res) => {
//   const { regNo, password } = req.body;
//   try {
//     const params = {
//       TableName: "LoginInfos",
//       FilterExpression: "regNo = :reg",
//       ExpressionAttributeValues: { ":reg": regNo }
//     };

//     const data = await dynamoDBClient.scan(params).promise();
//     if (data.Items.length === 0) return res.status(400).json({ error: 'Invalid Username' });

//     const user = data.Items[0];
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ error: 'Invalid Password' });

//     const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
//     req.session.regNo = regNo;

//     res.status(200).json({ message: 'Login successful', token });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error'});
// }
// });

// // ===== Fetch Cafes =====
// app.get('/api/cafes', async (req, res) => {
//   try {
//     const params = { TableName: "Cafes" };
//     const data = await dynamoDBClient.scan(params).promise();
//     res.json(data.Items);
//   } catch (error) {
//     console.error("Error fetching cafes:", error);
//     res.status(500).send("Server Error");
//   }
// });

// // Fetch All Food Items Route
// app.get("/api/items", async (req, res) => {
//   try {
//     const params = { TableName: "FoodItems" };
//     const data = await dynamoDBClient.scan(params).promise();
//     res.json(data.Items);
//   } catch (error) {
//     console.error("Error fetching food items:", error);
//     res.status(500).send("Server Error");
//   }
// });

// // get account details
// // app.get('/api/account', async (req, res) => {
// //     if (!req.session.regNo) {
// //         return res.status(401).json({ error: 'User not authenticated' });
// //     }
    
// //     try {
// //         const user = await User.findOne({ regNo: req.session.regNo });
// //         if (!user) {
// //             return res.status(404).json({ error: 'User not found' });
// //         }
// //         res.json({ user });
// //     } catch (error) {
// //         console.error("Error fetching user:", error);
// //         res.status(500).json({ error: "Server error" });
// //     }
// // });




// const razorpay = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET,
//   });
  
//   // Define the payment route directly in `server.js`
//   app.post("/api/payment/create-order", async (req, res) => {
//     try {
//       const { amount, currency } = req.body;
//       const options = {
//         amount: amount * 100, // Convert to paise
//         currency,
//         receipt: `receipt_${Date.now()}`,
//       };
  
//       const order = await razorpay.orders.create(options);
//       res.json({ success: true, order });
//     } catch (error) {
//       res.status(500).json({ success: false, message: "Order creation failed", error });
//     }
//   });

// // Serve Vite React Frontend
// import { fileURLToPath } from 'url';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// app.use(express.static(path.join(__dirname, "dist")));

// app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "dist", "index.html"));
// });
