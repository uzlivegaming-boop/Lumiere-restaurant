
require('dotenv').config();

const { Telegraf } = require('telegraf');
const prisma = require('../prisma');
const crypto = require('crypto');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const bot = TOKEN ? new Telegraf(TOKEN) : null;

async function telegramRequest(method, body = {}) {
  if (!TOKEN) throw new Error('TELEGRAM_BOT_TOKEN sozlanmagan');

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

// Mijoz akkauntini buyurtma yoki bron bilan ulash
async function handleStartMessage(message) {
  const text = message.text || '';
  const chatId = message.chat?.id;

  if (!chatId || message.chat?.type !== 'private') return;

  const match = text.match(/^\/start(?:@\w+)?\s+([a-f0-9]{48})$/i);

  if (!match) {
    await telegramRequest('sendMessage', {
      chat_id: chatId,
      text: 'Assalomu alaykum! Buyurtma yoki bronni ulash uchun saytdagi Telegram havolasidan foydalaning.',
    });
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

// Holat o‘zgarganda mijozga xabar yuborish
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

// Admin tugmalarini boshqarish
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

// Telegraf buyruqlari va hodisalari
if (bot) {
  bot.start(async (ctx) => {
    await handleStartMessage(ctx.message);
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
