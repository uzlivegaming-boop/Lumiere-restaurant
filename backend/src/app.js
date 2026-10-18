require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const {
  clerkMiddleware,
  getAuth
} = require('@clerk/express');

const prisma = require('./prisma');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  ...(process.env.FRONTEND_URL || '')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean)
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    if (
      /^https:\/\/[a-z0-9-]+(?:-[a-z0-9-]+)*\.vercel\.app$/i
        .test(origin)
    ) {
      return callback(null, true);
    }

    return callback(
      new Error(`CORS: ruxsat berilmagan manba: ${origin}`)
    );
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Backend va database holatini tekshirish uchun ochiq endpoint.
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return res.status(200).json({
      success: true,
      data: {
        status: 'ok',
        backend: 'connected',
        database: 'connected',
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error(
      'Health/database check failed:',
      err.message
    );

    return res.status(503).json({
      success: false,
      data: {
        status: 'degraded',
        backend: 'connected',
        database: 'disconnected',
        timestamp: new Date().toISOString()
      },
      error:
        'Backend ishlayapti, lekin database bilan aloqa yo‘q. ' +
        'DATABASE_URL va migratsiyalarni tekshiring.'
    });
  }
});

// Clerk autentifikatsiyasi.
app.use(clerkMiddleware());

app.get('/whoami', (req, res) => {
  const {
    userId,
    sessionId,
    sessionClaims
  } = getAuth(req);

  return res.json({
    success: true,
    data: {
      userId,
      sessionId,
      hasClaims: Boolean(sessionClaims)
    }
  });
});

// O‘yinlar uchun API.

// Mavjud bo‘lmagan endpoint.
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint topilmadi'
  });
});

// Umumiy xatolarni qaytarish.
app.use((err, req, res, next) => {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      error: err.issues
    });
  }

  if (err.message?.startsWith('CORS:')) {
    return res.status(403).json({
      success: false,
      error: err.message
    });
  }

  return res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Serverda kutilmagan xatolik'
  });
});

module.exports = app;