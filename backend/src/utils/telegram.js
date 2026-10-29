
require('dotenv').config();

const prisma = require('../prisma');
const crypto = require('crypto');

const API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

let pollingStarted = false;
let updateOffset = 0;

async function telegramRequest(method, body = {}) {
  const response = await fetch(`${API}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  });

  const result = await response.json();

  if (!response.ok || !result.ok) {
    throw new Error(result.description || 'Telegram API xatosi');
  }

  return result.result;
}

// Adminning Telegram chatiga xabar yuborish
async function sendTelegramMessage(message, replyMarkup) {
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!process.env.TELEGRAM_BOT_TOKEN || !chatId) {
    console.error('Telegram sozlamalari backend/.env faylida yo‘q');
    return false;
  }

  try {
    await telegramRequest('sendMessage', {
      chat_id: chatId,
      text: message,
      ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
    });

    console.log('Telegram xabari yuborildi');
    return true;
  } catch (error) {
    console.error('Telegram xatosi:', error.message);
    return false;
  }
}

// Telegram chat ID ma'lum bo‘lgan mijozga xabar yuborish
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

// Mijozning Telegram akkauntini buyurtma yoki bron bilan ulash
async function handleStartMessage(message) {
  const text = message.text || '';
  const chatId = message.chat?.id;

  if (!chatId || message.chat?.type !== 'private') return;

  const match = text.match(/^\/start(?:@\w+)?\s+([a-f0-9]{48})$/i);

  if (!match) {
    if (/^\/start(?:@\w+)?$/.test(text)) {
      await telegramRequest('sendMessage', {
        chat_id: chatId,
        text: 'Assalomu alaykum! Buyurtma yoki bronni ulash uchun saytdagi Telegram havolasidan foydalaning.',
      });
    }

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

// Buyurtma yoki bron holati o‘zgarganda mijozga xabar yuborish
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

// Adminning Telegram tugmalarini boshqarish
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

  const data = callback.data || '';
  const match = data.match(
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
      const existing = await prisma.order.findUnique({
        where: { id },
      });

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
      const existing = await prisma.booking.findUnique({
        where: { id },
      });

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

// Telegram xabarlarini tinglash
async function startTelegramPolling() {
  if (pollingStarted) return;

  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.log('Telegram tokeni yo‘q, polling ishga tushmadi');
    return;
  }

  pollingStarted = true;

  try {
    await telegramRequest('deleteWebhook', {
      drop_pending_updates: false,
    });

    console.log('Telegram xabarlari va tugmalari tinglanmoqda');

    while (true) {
      try {
        const updates = await telegramRequest('getUpdates', {
          offset: updateOffset,
          timeout: 25,
          allowed_updates: ['callback_query', 'message'],
        });

        for (const update of updates) {
          updateOffset = update.update_id + 1;

          try {
            if (update.callback_query) {
              await handleCallback(update.callback_query);
            }

            if (update.message?.text?.startsWith('/start')) {
              await handleStartMessage(update.message);
            }
          } catch (error) {
            console.error('Telegram update xatosi:', error.message);
          }
        }
      } catch (error) {
        console.error('Telegram polling xatosi:', error.message);

        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
  } catch (error) {
    pollingStarted = false;
    console.error('Telegram polling ishga tushmadi:', error.message);
  }
}

module.exports = {
  sendTelegramMessage,
  sendCustomerTelegramMessage,
  notifyCustomerStatus,
  createTelegramLinkToken,
  getTelegramLink,
  statusButtons,
  startTelegramPolling,
};
