import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import deviceRoutes from './routes/devices';
import videoRoutes from './routes/videos';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware - Simple CORS configuration
app.use(cors({
  origin: true,  // Allow all origins
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/videos', videoRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
