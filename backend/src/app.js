
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
const { errorHandler, notFound } = require('./middlewares/errorHandler');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  ...(process.env.FRONTEND_URL || '')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean),
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

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

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

if (!process.env.ADMIN_SESSION_SECRET) {
  throw new Error(
    'ADMIN_SESSION_SECRET backend/.env faylida sozlanmagan'
  );
}

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

app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return res.json({
      success: true,
      message: 'Lumiere Restaurant backend ishlayapti',
      database: 'connected',
    });
  } catch (error) {
    console.error('Database xatosi:', error.message);

    return res.status(503).json({
      success: false,
      message: 'Ma’lumotlar bazasiga ulanishda xatolik',
      database: 'disconnected',
    });
  }
});

app.use(clerkMiddleware());

app.use('/api/dishes', dishRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);


app.use(notFound)
app.use((err, req, res, next) => errorHandler(err, req, res, next))


module.exports = app;
