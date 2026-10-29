const prisma = require('../prisma');
const {
  sendTelegramMessage,
  statusButtons,
} = require('../utils/telegram');

const createBooking = async (req, res, next) => {
  try {
    const { name, phone, date, time, guests, note } = req.body;

    if (
      typeof name !== 'string' ||
      !name.trim() ||
      typeof phone !== 'string' ||
      !phone.trim() ||
      !date ||
      typeof time !== 'string' ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(time) ||
      !Number.isInteger(guests) ||
      guests < 1 ||
      guests > 50
    ) {
      return res.status(400).json({
        success: false,
        message: 'Ism, telefon, sana, vaqt va mehmonlar sonini to‘g‘ri kiriting',
      });
    }

    const bookingDate = new Date(`${date}T${time}:00`);

    if (
      Number.isNaN(bookingDate.getTime()) ||
      bookingDate <= new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Kelajakdagi sana va vaqtni tanlang',
      });
    }

    const booking = await prisma.booking.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        date: bookingDate,
        time,
        guests,
        note: typeof note === 'string' ? note.trim() || null : null,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        date: true,
        time: true,
        guests: true,
        note: true,
        status: true,
        createdAt: true,
      },
    });

    // Telegram xatosi bronni bekor qilmasligi kerak.
    try {
      await sendTelegramMessage(
        `🍽️ YANGI STOL BAND QILISH

🆔 Bron: #${booking.id}
👤 Ism: ${booking.name}
📞 Telefon: ${booking.phone}
📅 Sana: ${booking.date.toLocaleDateString('uz-UZ')}
🕒 Vaqt: ${booking.time}
👥 Mehmonlar: ${booking.guests}
📝 Izoh: ${booking.note || 'Yo‘q'}

📌 Holat: ${booking.status}`,
        statusButtons('booking', booking.id)
      );
    } catch (telegramError) {
      console.error('Telegram xabari yuborilmadi:', telegramError.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Stol band qilish so‘rovi qabul qilindi',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createBooking };