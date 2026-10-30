
require('dotenv').config();

const { Telegraf, Markup } = require('telegraf');
const prisma = require('../prisma');
const crypto = require('crypto');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const bot = TOKEN ? new Telegraf(TOKEN) : null;

const CUSTOMER_MENU = Markup.keyboard([
  ['🍽 Menyu', '🛒 Buyurtmalarim'],
  ['📅 Bronlarim', '👤 Profil'],
  ['📞 Aloqa'],
]).resize();

const ADMIN_MENU = Markup.keyboard([
  ['📦 Buyurtmalar', '📅 Bronlar'],
  ['📊 Statistika'],
  ['👤 Profil', '📞 Aloqa'],
]).resize();

const isAdmin = (ctx) => {
  return (
    process.env.TELEGRAM_ADMIN_ID &&
    String(ctx.from?.id) === String(process.env.TELEGRAM_ADMIN_ID)
  );
};

async function telegramRequest(method, body = {}) {
  if (!TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN sozlanmagan');
  }

  const response = await fetch(
    `https://api.telegram.org/bot${TOKEN}/${method}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    }
  );

  const result = await response.json();

  if (!response.ok || !result.ok) {
    throw new Error(result.description || 'Telegram API xatosi');
  }

  return result.result;
}

// Admin chatiga xabar yuborish
async function sendTelegramMessage(message, replyMarkup) {
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!TOKEN || !chatId) {
    console.error('Telegram sozlamalari topilmadi');
    return false;
  }

  try {
    await telegramRequest('sendMessage', {
      chat_id: chatId,
      text: message,
      ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
    });

    return true;
  } catch (error) {
    console.error('Telegram xatosi:', error.message);
    return false;
  }
}

// Mijozga xabar yuborish
async function sendCustomerTelegramMessage(chatId, message) {
  if (!chatId) return false;

  try {
    await telegramRequest('sendMessage', {
      chat_id: chatId,
      text: message,
    });

    return true;
  } catch (error) {
    console.error('Mijozga Telegram xabari yuborilmadi:', error.message);
    return false;
  }
}

function createTelegramLinkToken() {
  return crypto.randomBytes(24).toString('hex');
}

function getTelegramLink(token) {
  const username = process.env.TELEGRAM_BOT_USERNAME;

  if (!username || !token) return null;

  return `https://t.me/${username.replace(/^@/, '')}?start=${token}`;
}

function statusButtons(type, id) {
  return {
    inline_keyboard: [
      [
        {
          text: '✅ Tasdiqlash',
          callback_data: `${type}:CONFIRMED:${id}`,
        },
        {
          text: '❌ Bekor qilish',
          callback_data: `${type}:CANCELLED:${id}`,
        },
      ],
    ],
  };
}

// Buyurtma yoki bronni Telegram bilan ulash
async function handleStartMessage(message) {
  const text = message.text || '';
  const chatId = message.chat?.id;

  if (!chatId || message.chat?.type !== 'private') return;

  const match = text.match(/^\/start(?:@\w+)?\s+([a-f0-9]{48})$/i);

  // Oddiy /start
  if (!match) {
    return;
  }

  const token = match[1];

  try {
    const order = await prisma.order.findFirst({
      where: { telegramLinkToken: token },
    });

    if (order) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          customerTelegramChatId: String(chatId),
          telegramLinkToken: null,
        },
      });

      await telegramRequest('sendMessage', {
        chat_id: chatId,
        text: `✅ Telegram akkauntingiz ${order.id} raqamli buyurtmaga ulandi. Holat o‘zgarsa, sizga xabar yuboramiz.`,
      });

      return;
    }

    const booking = await prisma.booking.findFirst({
      where: { telegramLinkToken: token },
    });

    if (booking) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          customerTelegramChatId: String(chatId),
          telegramLinkToken: null,
        },
      });

      await telegramRequest('sendMessage', {
        chat_id: chatId,
        text: '✅ Telegram akkauntingiz stol broniga ulandi. Bron holati o‘zgarsa, sizga xabar yuboramiz.',
      });

      return;
    }

    await telegramRequest('sendMessage', {
      chat_id: chatId,
      text: 'Bu ulanish havolasi yaroqsiz yoki avval ishlatilgan. Saytdan yangi havola oling.',
    });
  } catch (error) {
    console.error('Telegram akkauntini ulash xatosi:', error.message);
  }
}

// Mijozga holat o‘zgargani haqida xabar
async function notifyCustomerStatus(type, record) {
  if (!record?.customerTelegramChatId) return false;

  const statusText = {
    CONFIRMED: '✅ Tasdiqlandi',
    CANCELLED: '❌ Bekor qilindi',
    PREPARING: '👨‍🍳 Tayyorlanmoqda',
    READY: '🍽️ Tayyor',
    COMPLETED: '🎉 Yakunlandi',
    PENDING: '⏳ Kutilmoqda',
  };

  const status = statusText[record.status] || record.status;

  const message =
    type === 'order'
      ? `LUMIERE RESTAURANT\n\nBuyurtmangiz holati yangilandi.\nBuyurtma: ${record.id}\nHolati: ${status}`
      : `LUMIERE RESTAURANT\n\nStol broningiz holati yangilandi.\nBron: ${record.id}\nHolati: ${status}`;

  return sendCustomerTelegramMessage(
    record.customerTelegramChatId,
    message
  );
}

// Admin tasdiqlash tugmalari
async function handleCallback(callback) {
  const adminId = process.env.TELEGRAM_ADMIN_ID;
  const targetChatId = process.env.TELEGRAM_CHAT_ID;

  if (
    !adminId ||
    String(callback.from?.id) !== String(adminId) ||
    String(callback.message?.chat?.id) !== String(targetChatId)
  ) {
    await telegramRequest('answerCallbackQuery', {
      callback_query_id: callback.id,
      text: 'Bu tugmalardan foydalanishga ruxsatingiz yo‘q.',
      show_alert: true,
    });
    return;
  }

  const match = (callback.data || '').match(
    /^(order|booking):(CONFIRMED|CANCELLED):([a-zA-Z0-9_-]+)$/
  );

  if (!match) {
    await telegramRequest('answerCallbackQuery', {
      callback_query_id: callback.id,
      text: 'Noto‘g‘ri buyruq.',
      show_alert: true,
    });
    return;
  }

  const [, type, status, id] = match;

  try {
    let record;

    if (type === 'order') {
      const existing = await prisma.order.findUnique({ where: { id } });

      if (!existing) throw new Error('Buyurtma topilmadi');

      if (existing.status !== 'PENDING') {
        await telegramRequest('answerCallbackQuery', {
          callback_query_id: callback.id,
          text: `Bu buyurtma allaqachon ${existing.status} holatida.`,
          show_alert: true,
        });
        return;
      }

      record = await prisma.order.update({
        where: { id },
        data: { status },
      });
    } else {
      const existing = await prisma.booking.findUnique({ where: { id } });

      if (!existing) throw new Error('Bron topilmadi');

      if (existing.status !== 'PENDING') {
        await telegramRequest('answerCallbackQuery', {
          callback_query_id: callback.id,
          text: `Bu bron allaqachon ${existing.status} holatida.`,
          show_alert: true,
        });
        return;
      }

      record = await prisma.booking.update({
        where: { id },
        data: { status },
      });
    }

    await notifyCustomerStatus(type, record);

    await telegramRequest('answerCallbackQuery', {
      callback_query_id: callback.id,
      text: status === 'CONFIRMED' ? 'Tasdiqlandi!' : 'Bekor qilindi!',
    });

    const oldText = callback.message?.text || '';
    const newText = `${oldText}\n\n📌 Yangi holat: ${
      status === 'CONFIRMED' ? '✅ TASDIQLANDI' : '❌ BEKOR QILINDI'
    }`;

    await telegramRequest('editMessageText', {
      chat_id: callback.message.chat.id,
      message_id: callback.message.message_id,
      text: newText,
      reply_markup: { inline_keyboard: [] },
    });
  } catch (error) {
    console.error('Telegram tugmasi xatosi:', error.message);

    await telegramRequest('answerCallbackQuery', {
      callback_query_id: callback.id,
      text: 'Holatni yangilab bo‘lmadi. Qayta tekshiring.',
      show_alert: true,
    });
  }
}

// Mijoz menyusi: taomlar
async function showDishes(ctx) {
  const dishes = await prisma.dish.findMany({
    where: { isAvailable: true },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  if (!dishes.length) {
    return ctx.reply('Hozircha menyuda taomlar mavjud emas.');
  }

  let message = '🍽 LUMIERE RESTAURANT MENYUSI\n\n';

  for (const dish of dishes) {
    message +=
      `🍴 ${dish.name}\n` +
      `📂 ${dish.category.name}\n` +
      `💰 ${Number(dish.price).toLocaleString('uz-UZ')} so‘m\n\n`;
  }

  await ctx.reply(message);
}

// Mijoz buyurtmalari
async function showMyOrders(ctx) {
  const orders = await prisma.order.findMany({
    where: {
      customerTelegramChatId: String(ctx.chat.id),
    },
    include: {
      items: {
        include: { dish: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  if (!orders.length) {
    return ctx.reply(
      'Sizga ulangan buyurtmalar topilmadi.\n\nBuyurtmani ulash uchun saytdagi Telegram havolasidan foydalaning.'
    );
  }

  for (const order of orders) {
    let message =
      `🛒 BUYURTMA\n` +
      `Raqam: ${order.id}\n` +
      `Holati: ${order.status}\n` +
      `Jami: ${Number(order.total).toLocaleString('uz-UZ')} so‘m\n\n`;

    for (const item of order.items) {
      message += `${item.dish.name} × ${item.quantity}\n`;
    }

    await ctx.reply(message);
  }
}

// Mijoz bronlari
async function showMyBookings(ctx) {
  const bookings = await prisma.booking.findMany({
    where: {
      customerTelegramChatId: String(ctx.chat.id),
    },
    orderBy: { date: 'desc' },
    take: 10,
  });

  if (!bookings.length) {
    return ctx.reply(
      'Sizga ulangan bronlar topilmadi.\n\nBronni ulash uchun saytdagi Telegram havolasidan foydalaning.'
    );
  }

  for (const booking of bookings) {
    await ctx.reply(
      `📅 STOL BRONI\n\n` +
      `Ism: ${booking.name}\n` +
      `Sana: ${new Date(booking.date).toLocaleDateString('uz-UZ')}\n` +
      `Vaqt: ${booking.time}\n` +
      `Mehmonlar: ${booking.guests}\n` +
      `Holati: ${booking.status}`
    );
  }
}

// Mijoz profili
async function showProfile(ctx) {
  const chatId = String(ctx.chat.id);

  const [order, booking] = await Promise.all([
    prisma.order.findFirst({
      where: { customerTelegramChatId: chatId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.booking.findFirst({
      where: { customerTelegramChatId: chatId },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const name = order?.customerName || booking?.name || 'Ma’lumot yo‘q';
  const phone = order?.phone || booking?.phone || 'Ma’lumot yo‘q';

  await ctx.reply(
    `👤 PROFIL\n\n` +
    `Ism: ${name}\n` +
    `Telefon: ${phone}\n` +
    `Telegram ID: ${chatId}\n\n` +
    `Profil ma’lumotlari buyurtma yoki bron ulanishidan olinadi.`
  );
}

// Admin: buyurtmalar
async function showAdminOrders(ctx) {
  if (!isAdmin(ctx)) {
    return ctx.reply('⛔ Bu bo‘lim faqat admin uchun.');
  }

  const orders = await prisma.order.findMany({
    include: {
      items: { include: { dish: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  if (!orders.length) {
    return ctx.reply('Hozircha buyurtmalar yo‘q.', ADMIN_MENU);
  }

  for (const order of orders) {
    let message =
      `📦 BUYURTMA\n` +
      `ID: ${order.id}\n` +
      `Mijoz: ${order.customerName}\n` +
      `Telefon: ${order.phone}\n` +
      `Manzil: ${order.address || 'Ko‘rsatilmagan'}\n` +
      `Holat: ${order.status}\n` +
      `Jami: ${Number(order.total).toLocaleString('uz-UZ')} so‘m\n\n`;

    for (const item of order.items) {
      message += `${item.dish.name} × ${item.quantity}\n`;
    }

    await ctx.reply(
      message,
      order.status === 'PENDING'
        ? Markup.inlineKeyboard([
            [
              Markup.button.callback(
                '✅ Tasdiqlash',
                `order:CONFIRMED:${order.id}`
              ),
              Markup.button.callback(
                '❌ Bekor qilish',
                `order:CANCELLED:${order.id}`
              ),
            ],
          ])
        : undefined
    );
  }
}

// Admin: bronlar
async function showAdminBookings(ctx) {
  if (!isAdmin(ctx)) {
    return ctx.reply('⛔ Bu bo‘lim faqat admin uchun.');
  }

  const bookings = await prisma.booking.findMany({
    orderBy: { date: 'desc' },
    take: 10,
  });

  if (!bookings.length) {
    return ctx.reply('Hozircha bronlar yo‘q.', ADMIN_MENU);
  }

  for (const booking of bookings) {
    await ctx.reply(
      `📅 BRON\n\n` +
      `ID: ${booking.id}\n` +
      `Ism: ${booking.name}\n` +
      `Telefon: ${booking.phone}\n` +
      `Sana: ${new Date(booking.date).toLocaleDateString('uz-UZ')}\n` +
      `Vaqt: ${booking.time}\n` +
      `Mehmonlar: ${booking.guests}\n` +
      `Holat: ${booking.status}`,
      booking.status === 'PENDING'
        ? Markup.inlineKeyboard([
            [
              Markup.button.callback(
                '✅ Tasdiqlash',
                `booking:CONFIRMED:${booking.id}`
              ),
              Markup.button.callback(
                '❌ Bekor qilish',
                `booking:CANCELLED:${booking.id}`
              ),
            ],
          ])
        : undefined
    );
  }
}

// Admin: statistika
async function showStatistics(ctx) {
  if (!isAdmin(ctx)) {
    return ctx.reply('⛔ Bu bo‘lim faqat admin uchun.');
  }

  const [ordersCount, bookingsCount, pendingOrders, completedOrders, revenue] =
    await Promise.all([
      prisma.order.count(),
      prisma.booking.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'COMPLETED' } }),
      prisma.order.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { total: true },
      }),
    ]);

  await ctx.reply(
    `📊 LUMIERE STATISTIKASI\n\n` +
    `📦 Jami buyurtmalar: ${ordersCount}\n` +
    `⏳ Kutilayotgan buyurtmalar: ${pendingOrders}\n` +
    `✅ Yakunlangan buyurtmalar: ${completedOrders}\n` +
    `📅 Jami bronlar: ${bookingsCount}\n` +
    `💰 Yakunlangan buyurtmalar tushumi: ${Number(
      revenue._sum.total || 0
    ).toLocaleString('uz-UZ')} so‘m`,
    ADMIN_MENU
  );
}

// Telegram menyulari
if (bot) {
  bot.start(async (ctx) => {
    const text = ctx.message.text || '';
    const hasToken = /^\/start(?:@\w+)?\s+[a-f0-9]{48}$/i.test(text);

    if (hasToken) {
      await handleStartMessage(ctx.message);
    }

    if (isAdmin(ctx)) {
      await ctx.reply(
        'Assalomu alaykum, admin! 👋\nLumiere Admin Panelga xush kelibsiz.',
        ADMIN_MENU
      );
    } else {
      await ctx.reply(
        'Assalomu alaykum! 👋\nLumiere Restaurant botiga xush kelibsiz.',
        CUSTOMER_MENU
      );
    }
  });

  bot.hears('🍽 Menyu', async (ctx) => {
    try {
      await showDishes(ctx);
    } catch (error) {
      console.error('Menyu xatosi:', error.message);
      await ctx.reply('Menyuni yuklashda xatolik yuz berdi.');
    }
  });

  bot.hears('🛒 Buyurtmalarim', async (ctx) => {
    try {
      await showMyOrders(ctx);
    } catch (error) {
      console.error('Buyurtmalar xatosi:', error.message);
      await ctx.reply('Buyurtmalarni yuklashda xatolik yuz berdi.');
    }
  });

  bot.hears('📅 Bronlarim', async (ctx) => {
    try {
      await showMyBookings(ctx);
    } catch (error) {
      console.error('Bronlar xatosi:', error.message);
      await ctx.reply('Bronlarni yuklashda xatolik yuz berdi.');
    }
  });

  bot.hears('👤 Profil', async (ctx) => {
    try {
      await showProfile(ctx);
    } catch (error) {
      console.error('Profil xatosi:', error.message);
      await ctx.reply('Profilni yuklashda xatolik yuz berdi.');
    }
  });

  bot.hears('📞 Aloqa', async (ctx) => {
    await ctx.reply(
      '📞 LUMIERE RESTAURANT\n\n' +
      'Telefon: +998 93 985 40 43\n\n' +
      'Biz bilan bog‘lanishingiz mumkin.'
    );
  });

  bot.hears('📦 Buyurtmalar', async (ctx) => {
    try {
      await showAdminOrders(ctx);
    } catch (error) {
      console.error('Admin buyurtmalar xatosi:', error.message);
      await ctx.reply('Buyurtmalarni yuklashda xatolik yuz berdi.');
    }
  });

  bot.hears('📅 Bronlar', async (ctx) => {
    try {
      await showAdminBookings(ctx);
    } catch (error) {
      console.error('Admin bronlar xatosi:', error.message);
      await ctx.reply('Bronlarni yuklashda xatolik yuz berdi.');
    }
  });

  bot.hears('📊 Statistika', async (ctx) => {
    try {
      await showStatistics(ctx);
    } catch (error) {
      console.error('Statistika xatosi:', error.message);
      await ctx.reply('Statistikani hisoblashda xatolik yuz berdi.');
    }
  });

  bot.on('callback_query', async (ctx) => {
    await handleCallback(ctx.callbackQuery);
  });

  bot.catch((error) => {
    console.error('Telegraf xatosi:', error.message);
  });
}

// Webhook manzilini Telegramga ro‘yxatdan o‘tkazish
async function setTelegramWebhook() {
  if (!bot) {
    console.log('Telegram tokeni yo‘q, bot ishga tushmadi');
    return;
  }

  const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (!webhookUrl || !secret) {
    throw new Error(
      'TELEGRAM_WEBHOOK_URL yoki TELEGRAM_WEBHOOK_SECRET sozlanmagan'
    );
  }

  await bot.telegram.setWebhook(webhookUrl, {
    secret_token: secret,
    allowed_updates: ['message', 'callback_query'],
  });

  console.log('Telegram Webhook ro‘yxatdan o‘tkazildi');
}

function getTelegramWebhookMiddleware() {
  if (!bot) {
    throw new Error('Telegram bot tokeni sozlanmagan');
  }

  return bot.webhookCallback('/telegram/webhook', {
    secretToken: process.env.TELEGRAM_WEBHOOK_SECRET,
  });
}

module.exports = {
  bot,
  sendTelegramMessage,
  sendCustomerTelegramMessage,
  notifyCustomerStatus,
  createTelegramLinkToken,
  getTelegramLink,
  statusButtons,
  setTelegramWebhook,
  getTelegramWebhookMiddleware,
};
