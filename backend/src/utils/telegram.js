
require('dotenv').config();

async function sendTelegramMessage(message) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error('Telegram tokeni yoki chat ID .env faylida yo‘q');
    return false;
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.ok) {
      console.error('Telegram xatosi:', result);
      return false;
    }

    console.log('Telegram xabari yuborildi');
    return true;
  } catch (error) {
    console.error('Telegramga ulanish xatosi:', error.message);
    return false;
  }
}

module.exports = { sendTelegramMessage };
