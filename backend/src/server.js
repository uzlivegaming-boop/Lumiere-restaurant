
require('dotenv').config();

const app = require('./app');
const { startTelegramPolling } = require('./utils/telegram');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server ${PORT}-portda ishlamoqda: http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log('Prisma Studio: npm run db:studio');

  // Telegram bot tugmalarini tinglashni boshlash
  startTelegramPolling();
});

// Server xatolarini ko‘rsatish
server.on('error', (error) => {
  console.error('Serverni ishga tushirishda xatolik:', error.message);
});
