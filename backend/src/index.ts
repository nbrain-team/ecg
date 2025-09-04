import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import proposalRoutes from './routes/proposals';
import destinationRoutes from './routes/destinations';
import authRoutes from './routes/auth';
import hotelRoutes from './routes/hotels';
import hotelIntegrationRoutes from './routes/hotelIntegration';
import seedRoomsRoutes from './routes/seedRooms';
import updateRoomImagesRoutes from './routes/updateRoomImages';
import { applySchema } from './db/migrate';
import { bootstrapGrandVelasIfMissing } from './db/bootstrap';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, 'https://ecg-intelligence-frontend.onrender.com', 'https://eventintel-app.onrender.com']
    : ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/hotel-integration', hotelIntegrationRoutes);
app.use('/api/seed', seedRoomsRoutes);
app.use('/api/update', updateRoomImagesRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  try {
    await applySchema();
    await bootstrapGrandVelasIfMissing();
  } catch (err) {
    console.error('Startup tasks failed:', err);
  }
}); 