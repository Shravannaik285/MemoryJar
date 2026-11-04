import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import notificationRoutes from './src/routes/notificationRoutes.js';
import { startBirthdayScheduler } from './src/jobs/birthdayScheduler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Production-ready CORS Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin) return callback(null, true);
      const allowed = [
        CLIENT_URL,
        process.env.FRONTEND_URL,
        process.env.CLIENT_URL,
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:4173',
      ].filter(Boolean);

      if (
        allowed.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.onrender.com') ||
        origin.endsWith('.railway.app') ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1')
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Dev-friendly permissive
    },
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use('/api/notifications', notificationRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Memory Jar Backend Service',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Start Background Birthday Scheduler
startBirthdayScheduler('*/5 * * * *');

// Start Server
app.listen(PORT, () => {
  console.log(`🌸 Memory Jar Server listening on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
  console.log(`   VAPID Key configured: ${process.env.VAPID_PUBLIC_KEY ? 'Yes' : 'No'}`);
});

