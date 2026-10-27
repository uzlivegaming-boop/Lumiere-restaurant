
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const prisma = require('../prisma');

const {
  sendTelegramMessage,
  statusButtons,
  getTelegramLink,
} = require('../utils/telegram');

// Yangi buyurtma yaratish
router.post('/', async (req, res) => {
  try {
    const { customerName, phone, address, note, items } = req.body;

    if (
      !customerName ||
      !phone ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Ism, telefon va taomlar ro‘yxati kerak',
      });
    }

    const dishIds = [...new Set(items.map((item) => item.dishId))];

    if (
      dishIds.some((id) => typeof id !== 'string' || !id.trim()) ||
      items.some(
        (item) =>
          !Number.isInteger(item.quantity) ||
          item.quantity < 1 ||
          item.quantity > 50
      )
    ) {
      return res.status(400).json({
        success: false,
        message: 'Taom ID yoki miqdori noto‘g‘ri',
      });
    }

    const dishes = await prisma.dish.findMany({
      where: {
        id: { in: dishIds },
        isAvailable: true,
      },
    });

    if (dishes.length !== dishIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Taomlardan biri mavjud emas',
      });
    }

    const dishMap = new Map(
      dishes.map((dish) => [dish.id, dish])
    );

    const orderItems = items.map((item) => ({
      dishId: item.dishId,
      quantity: item.quantity,
      unitPrice: dishMap.get(item.dishId).price,
    }));

    const total = orderItems.reduce(
      (sum, item) =>
        sum + Number(item.unitPrice) * item.quantity,
      0
    );

    // Har bir buyurtma uchun taxmin qilish qiyin bo‘lgan token
    const telegramLinkToken = crypto.randomBytes(24).toString('hex');

    const order = await prisma.order.create({
      data: {
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: address?.trim() || null,
        note: note?.trim() || null,
        total: total.toFixed(2),
        telegramLinkToken,
        items: {
          create: orderItems,
        },
      },
      select: {
        id: true,
        status: true,
        total: true,
        createdAt: true,
      },
    });

    const telegramMessage = [
      '🍽️ LUMIERE RESTAURANT',
      '',
      '🆕 Yangi buyurtma!',
      `🧾 Buyurtma: #${order.id}`,
      `👤 Mijoz: ${customerName}`,
      `📞 Telefon: ${phone}`,
      `📍 Manzil: ${address || 'Ko‘rsatilmagan'}`,
      '',
      '🛒 Taomlar:',
      ...orderItems.map((item) => {
        const dish = dishMap.get(item.dishId);
        return `• ${dish.name} × ${item.quantity} — ${
          (Number(item.unitPrice) * item.quantity).toLocaleString('uz-UZ')
        } so‘m`;
      }),
      '',
      `💰 Jami: ${total.toLocaleString('uz-UZ')} so‘m`,
      `📝 Izoh: ${note || 'Yo‘q'}`,
    ].join('\n');

    try {
      await sendTelegramMessage(
        telegramMessage,
        statusButtons('order', order.id)
      );
    } catch (telegramError) {
      console.error(
        'Telegram xabarini yuborishda xatolik:',
        telegramError.message
      );
    }

    const telegramLink = getTelegramLink(telegramLinkToken);

    return res.status(201).json({
      success: true,
      message: 'Buyurtmangiz qabul qilindi',
      data: {
        ...order,
        telegramLink,
      },
    });
  } catch (error) {
    console.error('Buyurtma yaratish xatosi:', error);

    return res.status(500).json({
      success: false,
      message: 'Buyurtmani saqlashda xatolik yuz berdi',
    });
  }
});

module.exports = router;
