// 1. DNS Fix: Force Node.js to use Google/Cloudflare DNS to resolve MongoDB Atlas addresses
const dns = require("node:dns/promises");
dns.setServers(["8.8.8.8", "1.1.1.1"]); //

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

// Import Routes
const studentRoutes = require('./routes/studentRoute');
const adminRoutes = require('./routes/adminRoute');
// Load environment variables from .env
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// 2. Database Connection Logic
const connectDB = async () => {
  try {
    // Uses the MONGO_URI from your .env file
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Database Error: ${error.message}`);
    process.exit(1); // Exit process if connection fails
  }
};

// Execute Connection
connectDB();

// 3. API Routes 
// This tells Express to send any requests starting with /api/students to your student routes file
app.use('/api/students', studentRoutes);
app.use('/api/admins', adminRoutes);

// Basic Health Check Route
app.get('/', (req, res) => {
  res.send('AuraLive Backend API is running...');
});

// 4. Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running in development mode on port ${PORT}`);
});