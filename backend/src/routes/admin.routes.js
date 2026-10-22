
const express = require('express');
const crypto = require('crypto');

const router = express.Router();
const prisma = require('../prisma');
const requireAdmin = require('../middlewares/adminAuth');

// Admin tizimiga kirish
router.post('/login', (req, res) => {
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
});

// Admin holatini tekshirish
router.get('/me', (req, res) => {
  res.json({
    success: true,
    isAdmin: req.session?.isAdmin === true,
  });
});

// Admin tizimidan chiqish
router.post('/logout', requireAdmin, (req, res) => {
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
});

// Faqat admin buyurtmalarni ko‘ra oladi
router.get('/orders', requireAdmin, async (req, res) => {
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
    console.error('Admin buyurtmalar xatosi:', error);

    return res.status(500).json({
      success: false,
      message: 'Buyurtmalarni olishda xatolik',
    });
  }
});

const allowedStatuses = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'COMPLETED',
  'CANCELLED',
];

router.patch('/orders/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Buyurtma holati noto‘g‘ri',
      });
    }

    const order = await prisma.order.update({
      where: { id },
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

    console.error('Holatni yangilash xatosi:', error);

    return res.status(500).json({
      success: false,
      message: 'Buyurtma holatini yangilab bo‘lmadi',
    });
  }
});

module.exports = router;
