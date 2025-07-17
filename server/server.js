import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import bankRoutes from './routes/bankRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';


dotenv.config();
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());

// DB
connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/bank', bankRoutes);
app.use('/api/transactions', transactionRoutes);



// Routes
app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
