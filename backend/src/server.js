
require('dotenv').config();

const app = require('./app');
const { setTelegramWebhook } = require('./utils/telegram');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, async () => {
  console.log(`Server ${PORT}-portda ishlamoqda`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log('Prisma Studio: npm run db:studio');

  try {
    await setTelegramWebhook();
    console.log('Telegram Webhook tayyor');
  } catch (error) {
    console.error(
      'Telegram Webhook sozlashda xatolik:',
      error.message
    );
  }
});

// Server xatolarini ko‘rsatish
server.on('error', (error) => {
  console.error(
    'Serverni ishga tushirishda xatolik:',
    error.message
  );
});
