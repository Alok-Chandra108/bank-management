import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import bankRoutes from './routes/bankRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import cardRoutes from './routes/cardRoutes.js';

import cookieParser from 'cookie-parser';
import compression from 'compression';

dotenv.config(); // Load environment variables from .env file

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL, // This should be the URL of your deployed frontend on Render
  credentials: true
}));

app.use(express.json()); // Parses incoming JSON requests
app.use(cookieParser()); // Parses cookies from incoming requests
app.use(compression()); // Compresses response bodies for improved performance

// Connect to DB
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/bank', bankRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/cards', cardRoutes);


// Basic Route for testing deployment (Optional)
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// Error Handling Middleware (Recommended for production)
// This should be the last middleware added
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack for debugging
  res.status(500).send('Something broke!'); // Send a generic error response
});

// Start server
const PORT = process.env.PORT || 5000; // Use port provided by Render or default to 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));