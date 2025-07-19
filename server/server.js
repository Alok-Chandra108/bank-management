import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import bankRoutes from './routes/bankRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import cookieParser from 'cookie-parser';
import compression from 'compression';

import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(compression()); // optional but improves performance

// Connect to DB
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/bank', bankRoutes);
app.use('/api/transactions', transactionRoutes);

// ---------- Serve frontend in production ----------
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '/client/dist')));

  // Handles all client-side routes
  app.get('/*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'dist', 'index.html'));
  });
} else {
  // Health check route in dev
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
