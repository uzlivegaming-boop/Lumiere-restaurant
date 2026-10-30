
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const session = require('express-session');
const { clerkMiddleware } = require('@clerk/express');

const prisma = require('./prisma');

const adminRoutes = require('./routes/admin.routes');
const dishRoutes = require('./routes/dish.routes');
const categoryRoutes = require('./routes/category.routes');
const orderRoutes = require('./routes/order.routes');
const bookingRoutes = require('./routes/booking.routes');
const contactRoutes = require('./routes/contact.routes');

const {
  getTelegramWebhookMiddleware,
} = require('./utils/telegram');

const {
  errorHandler,
  notFound,
} = require('./middlewares/errorHandler');

const app = express();

// Ruxsat berilgan frontend manzillari
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  ...(process.env.FRONTEND_URL || '')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean),
];

// CORS sozlamalari
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Vercel domenlari
      if (
        /^https:\/\/[a-z0-9-]+(?:-[a-z0-9-]+)*\.vercel\.app$/i.test(origin)
      ) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS: ruxsat berilmagan manba: ${origin}`)
      );
    },
    credentials: true,
  })
);

// Umumiy middleware'lar
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Telegram Webhook
app.post(
  '/telegram/webhook',
  getTelegramWebhookMiddleware()
);

// Admin sessiyasi uchun maxfiy kalit
if (!process.env.ADMIN_SESSION_SECRET) {
  throw new Error(
    'ADMIN_SESSION_SECRET backend/.env faylida sozlanmagan'
  );
}

// Admin sessiyasi
app.use(
  session({
    name: 'lumiere.admin.sid',
    secret: process.env.ADMIN_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 8,
    },
  })
);

// Server va ma'lumotlar bazasini tekshirish
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return res.status(200).json({
      success: true,
      message: 'Lumiere Restaurant backend ishlayapti',
      database: 'connected',
    });
  } catch (error) {
    console.error('Database xatosining to‘liq tafsiloti:');
    console.error(error);

    return res.status(503).json({
      success: false,
      message: 'Ma’lumotlar bazasiga ulanishda xatolik',
      database: 'disconnected',
    });
  }
});

// Clerk autentifikatsiyasi
app.use(clerkMiddleware());

// API route'lari
app.use('/api/dishes', dishRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);

// Topilmagan route
app.use(notFound);

// Umumiy xatolarni qayta ishlash
app.use(errorHandler);

module.exports = app;
