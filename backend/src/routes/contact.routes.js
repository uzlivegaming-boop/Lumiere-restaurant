const express = require('express');
const router = express.Router();
const { sendTelegramMessage } = require('../utils/telegram');

router.post('/', async (req, res) => {
  try {
    const { name, phone, username, message } = req.body;

    if (
      typeof name !== 'string' ||
      typeof phone !== 'string' ||
      typeof username !== 'string' ||
      typeof message !== 'string' ||
      !name.trim() ||
      !phone.trim() ||
      !username.trim() ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Barcha maydonlarni to‘ldiring.',
      });
    }

    const cleanUsername = username.trim().replace(/^@/, '');

    if (!/^[a-zA-Z0-9_]{5,32}$/.test(cleanUsername)) {
      return res.status(400).json({
        success: false,
        message: 'Telegram username noto‘g‘ri kiritilgan.',
      });
    }

    const text = [
      '📩 LUMIERE RESTAURANT — yangi murojaat',
      '',
      `👤 Ism: ${name.trim()}`,
      `📞 Telefon: ${phone.trim()}`,
      `✈️ Telegram: @${cleanUsername}`,
      `🔗 Mijoz profili: https://t.me/${cleanUsername}`,
      '',
      `💬 Xabar: ${message.trim()}`,
      '',
      '📬 Admin profili: https://t.me/Stranger_Vibe',
    ].join('\n');

    const sent = await sendTelegramMessage(text);

    if (!sent) {
      return res.status(502).json({
        success: false,
        message: 'Telegramga xabar yuborilmadi. Bot sozlamalarini tekshiring.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Murojaatingiz muvaffaqiyatli yuborildi.',
    });
  } catch (error) {
    console.error('Contact xatosi:', error);

    return res.status(500).json({
      success: false,
      message: 'Murojaat yuborishda xatolik yuz berdi.',
    });
  }
});

module.exports = router;