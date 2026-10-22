
const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

// Barcha kategoriyalarni olish
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            dishes: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Kategoriyalarni olish xatosi:', error);

    return res.status(500).json({
      success: false,
      message: 'Kategoriyalarni olishda xatolik yuz berdi',
    });
  }
});

module.exports = router;
