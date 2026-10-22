
const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

// Stol band qilish
router.post('/', async (req, res) => {
  try {
    const { name, phone, date, guests, note } = req.body;

    if (
      typeof name !== 'string' ||
      !name.trim() ||
      typeof phone !== 'string' ||
      !phone.trim() ||
      !date ||
      !Number.isInteger(guests) ||
      guests < 1 ||
      guests > 50
    ) {
      return res.status(400).json({
        success: false,
        message: 'Ism, telefon, sana va mehmonlar sonini to‘g‘ri kiriting',
      });
    }

    const bookingDate = new Date(date);

    if (
      Number.isNaN(bookingDate.getTime()) ||
      bookingDate <= new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Kelajakdagi to‘g‘ri sanani tanlang',
      });
    }

    const booking = await prisma.booking.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        date: bookingDate,
        guests,
        note: typeof note === 'string' ? note.trim() || null : null,
      },
      select: {
        id: true,
        name: true,
        date: true,
        guests: true,
        status: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Stol band qilish so‘rovi qabul qilindi',
      data: booking,
    });
  } catch (error) {
    console.error('Stol band qilish xatosi:', error);

    return res.status(500).json({
      success: false,
      message: 'Stol band qilishda xatolik yuz berdi',
    });
  }
});

module.exports = router;
