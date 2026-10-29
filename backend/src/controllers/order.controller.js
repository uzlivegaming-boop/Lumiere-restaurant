
const crypto = require('crypto');
const prisma = require('../prisma');

const {
  sendTelegramMessage,
  statusButtons,
  getTelegramLink,
} = require('../utils/telegram');

const createOrder = async (req, res, next) => {
  try {
    const { customerName, phone, address, note, items } = req.body;

    // Mijoz ma'lumotlarini tekshirish
    if (
      typeof customerName !== 'string' ||
      customerName.trim().length < 2 ||
      customerName.trim().length > 100 ||
      typeof phone !== 'string' ||
      phone.trim().length < 7 ||
      phone.trim().length > 30 ||
      !Array.isArray(items) ||
      items.length === 0 ||
      items.length > 50
    ) {
      return res.status(400).json({
        success: false,
        message: 'Ism, telefon va taomlar ro‘yxatini to‘g‘ri kiriting',
      });
    }

    if (
      (address != null &&
        (typeof address !== 'string' || address.length > 500)) ||
      (note != null &&
        (typeof note !== 'string' || note.length > 1000))
    ) {
      return res.status(400).json({
        success: false,
        message: 'Manzil yoki izoh juda uzun yoki noto‘g‘ri',
      });
    }

    // Taom ID va miqdorlarini tekshirish
    const invalidItems = items.some(
      (item) =>
        !item ||
        typeof item.dishId !== 'string' ||
        !item.dishId.trim() ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 50
    );

    if (invalidItems) {
      return res.status(400).json({
        success: false,
        message: 'Taom ID yoki miqdori noto‘g‘ri',
      });
    }

    // Bir xil taomlarni bitta qatorga birlashtirish
    const quantities = new Map();

    for (const item of items) {
      const current = quantities.get(item.dishId) || 0;
      const nextQuantity = current + item.quantity;

      if (nextQuantity > 50) {
        return res.status(400).json({
          success: false,
          message: 'Bitta taom miqdori 50 tadan oshmasin',
        });
      }

      quantities.set(item.dishId, nextQuantity);
    }

    const dishIds = [...quantities.keys()];

    // Bazadan mavjud va sotuvdagi taomlarni olish
    const dishes = await prisma.dish.findMany({
      where: {
        id: { in: dishIds },
        isAvailable: true,
      },
    });

    if (dishes.length !== dishIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Taomlardan biri topilmadi yoki sotuvda mavjud emas',
      });
    }

    const dishMap = new Map(
      dishes.map((dish) => [dish.id, dish])
    );

    // Narxlarni faqat bazadagi narxlar asosida hisoblash
    const orderItems = dishIds.map((dishId) => ({
      dishId,
      quantity: quantities.get(dishId),
      unitPrice: dishMap.get(dishId).price,
    }));

    const totalInTiyin = orderItems.reduce((sum, item) => {
      const priceInTiyin = Math.round(
        Number(item.unitPrice) * 100
      );

      return sum + priceInTiyin * item.quantity;
    }, 0);

    const total = (totalInTiyin / 100).toFixed(2);
    const telegramLinkToken = crypto.randomBytes(24).toString('hex');

    // Buyurtmani bazaga yozish
    const order = await prisma.order.create({
      data: {
        customerName: customerName.trim(),
        phone: phone.trim(),
        address:
          typeof address === 'string' ? address.trim() || null : null,
        note:
          typeof note === 'string' ? note.trim() || null : null,
        total,
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

    // Adminga Telegram xabari
    const telegramMessage = [
      '🍽️ LUMIERE RESTAURANT',
      '',
      '🆕 Yangi buyurtma!',
      `🧾 Buyurtma: #${order.id}`,
      `👤 Mijoz: ${customerName.trim()}`,
      `📞 Telefon: ${phone.trim()}`,
      `📍 Manzil: ${address?.trim() || 'Ko‘rsatilmagan'}`,
      '',
      '🛒 Taomlar:',
      ...orderItems.map((item) => {
        const dish = dishMap.get(item.dishId);
        const itemTotal =
          Math.round(Number(item.unitPrice) * 100) * item.quantity;

        return `• ${dish.name} × ${item.quantity} — ${(
          itemTotal / 100
        ).toLocaleString('uz-UZ')} so‘m`;
      }),
      '',
      `💰 Jami: ${(totalInTiyin / 100).toLocaleString('uz-UZ')} so‘m`,
      `📝 Izoh: ${note?.trim() || 'Yo‘q'}`,
    ].join('\n');

    try {
      await sendTelegramMessage(
        telegramMessage,
        statusButtons('order', order.id)
      );
    } catch (telegramError) {
      // Telegram xatosi saqlangan buyurtmani bekor qilmaydi
      console.error(
        'Telegram xabarini yuborishda xatolik:',
        telegramError.message
      );
    }

    let telegramLink = null;

    try {
      telegramLink = getTelegramLink(telegramLinkToken);
    } catch (telegramError) {
      console.error(
        'Telegram havolasini yaratishda xatolik:',
        telegramError.message
      );
    }

    return res.status(201).json({
      success: true,
      message: 'Buyurtmangiz qabul qilindi',
      data: {
        ...order,
        telegramLink,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { createOrder };
