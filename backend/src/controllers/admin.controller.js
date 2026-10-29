const crypto = require('crypto');
const prisma = require('../prisma');

const allowedStatuses = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'COMPLETED',
  'CANCELLED',
];

const allowedBookingStatuses = [
  'PENDING',
  'CONFIRMED',
  'CANCELLED',
];

const login = (req, res) => {
  const { password } = req.body || {};
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return res.status(500).json({
      success: false,
      message: 'ADMIN_PASSWORD sozlanmagan',
    });
  }

  if (
    typeof password !== 'string' ||
    Buffer.byteLength(password) !== Buffer.byteLength(adminPassword) ||
    !crypto.timingSafeEqual(
      Buffer.from(password),
      Buffer.from(adminPassword)
    )
  ) {
    return res.status(401).json({
      success: false,
      message: 'Parol noto‘g‘ri',
    });
  }

  req.session.regenerate((error) => {
    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Sessiya yaratilmadi',
      });
    }

    req.session.isAdmin = true;

    req.session.save((saveError) => {
      if (saveError) {
        return res.status(500).json({
          success: false,
          message: 'Sessiyani saqlab bo‘lmadi',
        });
      }

      return res.json({
        success: true,
        message: 'Admin tizimga kirdi',
      });
    });
  });
};

const getMe = (req, res) => {
  return res.json({
    success: true,
    isAdmin: req.session?.isAdmin === true,
  });
};

const logout = (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Tizimdan chiqishda xatolik',
      });
    }

    res.clearCookie('lumiere.admin.sid', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return res.json({
      success: true,
      message: 'Admin tizimdan chiqdi',
    });
  });
};

const getOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            dish: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Buyurtma holati noto‘g‘ri',
      });
    }

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
    });

    return res.json({
      success: true,
      message: 'Buyurtma holati yangilandi',
      data: order,
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Buyurtma topilmadi',
      });
    }

    next(error);
  }
};

const getBookings = async (req, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!allowedBookingStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Band qilish holati noto‘g‘ri',
      });
    }

    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status },
    });

    return res.json({
      success: true,
      message: 'Band qilish holati yangilandi',
      data: booking,
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Band qilish topilmadi',
      });
    }

    next(error);
  }
};

module.exports = {
  login,
  getMe,
  logout,
  getOrders,
  updateOrderStatus,
  getBookings,
  updateBookingStatus,
};