import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
dotenv.config();

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/users.routes';
import tripRoutes from './routes/trips.routes';
import stopRoutes from './routes/stops.routes';
import cityRoutes from './routes/cities.routes';
import activityRoutes from './routes/activities.routes';
import budgetRoutes from './routes/budget.routes';
import checklistRoutes from './routes/checklist.routes';
import noteRoutes from './routes/notes.routes';
import shareRoutes from './routes/share.routes';
import adminRoutes from './routes/admin.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Security & CORS
app.use(helmet());
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'Traveloop API' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trips', tripRoutes);        // GET/POST/PUT/DELETE /api/trips
app.use('/api/trips', stopRoutes);        // /api/trips/:tripId/stops/* + /api/trips/stops/:stopId/activities/*
app.use('/api/trips', budgetRoutes);      // /api/trips/:tripId/budget
app.use('/api/trips', checklistRoutes);   // /api/trips/:tripId/checklist
app.use('/api/trips', noteRoutes);        // /api/trips/:tripId/notes
app.use('/api/cities', cityRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/share', shareRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler (must be last)
app.use(errorHandler);

const PORT = parseInt(process.env.PORT || '5000', 10);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Traveloop API running on http://localhost:${PORT}`);
  console.log(`📚 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 CORS allowed origin: ${process.env.CLIENT_URL || 'http://localhost:3000'}\n`);
});

export default app;
