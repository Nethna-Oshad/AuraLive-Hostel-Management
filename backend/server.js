// 1. DNS Fix: Force Node.js to use Google/Cloudflare DNS to resolve MongoDB Atlas addresses
const dns = require("node:dns/promises");
dns.setServers(["8.8.8.8", "1.1.1.1"]); 

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path'); 
const cron = require('node-cron'); 
const Booking = require('./models/bookingModel'); 

// --- Import Routes ---
const authRoutes = require('./routes/authRoute'); 
const roomRoutes = require('./routes/roomRoute');
const bookingRoutes = require('./routes/bookingRoute'); 
const reviewRoutes = require('./routes/reviewRoutes');
const contactRoutes = require('./routes/contactRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoute'); 
// -------------------------------------
const maintainerRoutes = require('./routes/maintainerRoute');
const chatbotRoutes = require('./routes/chatbotRoute');
const paymentRoutes = require('./routes/paymentRoute');
const laundryRoutes = require('./routes/laundryRoute');
const invoiceRoutes = require('./routes/invoiceRoute');
const mealRoutes = require('./routes/mealRoute');

// 👇 --- NEW: SWAGGER IMPORTS --- 👇
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger/swaggerConfig');
// 👆 ---------------------------- 👆

// Load environment variables from .env
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// 👇 --- NEW: SWAGGER UI ROUTE --- 👇
// This creates the visual dashboard at http://localhost:5000/api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// 👆 ----------------------------- 👆

// 👇 --- SERVE STATIC FILES --- 👇
app.use(express.static(path.join(__dirname, '../frontend/public')));
// Static folder for Profile Pictures
app.use('/Studentprofile', express.static('Studentprofile'));
// 👆 -------------------------- 👆

// 2. Database Connection Logic
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Database Error: ${error.message}`);
    process.exit(1); 
  }
};

// Execute Connection
connectDB();

// ======================================================
// 3. AUTOMATION: THE MONTHLY RENT TIMER (CRON JOB)
// ======================================================
// This runs at 00:00 (Midnight) on the 25th of every month
cron.schedule('0 0 25 * *', async () => {
  console.log("⏰ [SYSTEM] Running Monthly Rent Status Update...");
  try {
    const result = await Booking.updateMany(
      { status: 'Confirmed' }, 
      { $set: { monthlyRentStatus: 'Unpaid' } }
    );
    console.log(`✅ Success: ${result.modifiedCount} students marked as Unpaid for the new month.`);
  } catch (err) {
    console.error("❌ Automation Error:", err.message);
  }
});

// 4. API Routes 
app.use('/api/auth', authRoutes); 
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/maintenance', maintenanceRoutes); 
// ---------------------------------------
app.use('/api/maintainers', maintainerRoutes);
app.use('/api/chat', chatbotRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/laundry', laundryRoutes); 
app.use('/api/invoices', invoiceRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/contact', contactRoutes);

// Basic Health Check Route
app.get('/', (req, res) => {
  res.send('AuraLive Backend API is running...');
});

// 5. Global Error Handler
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
  console.log(`📅 Monthly Rent Automation is scheduled for the 25th of every month.`);
  console.log(`📖 Swagger API Docs available at http://localhost:${PORT}/api-docs`); // Added this so you can click it easily in the terminal!
});