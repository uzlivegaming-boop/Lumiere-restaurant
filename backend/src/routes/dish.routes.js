
const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

// Barcha taomlarni olish
router.get('/', async (req, res) => {
  try {
    const dishes = await prisma.dish.findMany({
      include: {
        category: true,
        ratings: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json(dishes);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Taomlarni olishda xatolik yuz berdi',
    });
  }
});

// ID orqali bitta taomni olish
router.get('/:id', async (req, res) => {
  try {
    const dish = await prisma.dish.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        category: true,
        ratings: true,
      },
    });

    if (!dish) {
      return res.status(404).json({
        message: 'Taom topilmadi',
      });
    }

    res.status(200).json(dish);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Taomni olishda xatolik yuz berdi',
    });
  }
});

module.exports = router;
