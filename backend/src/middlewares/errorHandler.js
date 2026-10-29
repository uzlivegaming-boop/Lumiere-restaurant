const notFound = (req, res) => {
  return res.status(404).json({
    success: false,
    message: `Yo‘l topilmadi: ${req.method} ${req.originalUrl}`,
  });
};

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  // Zod validatsiya xatosi
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: 'Kiritilgan ma’lumotlar noto‘g‘ri',
      errors: err.issues?.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })) || [],
    });
  }

  // Prisma: yozuv topilmadi
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Ma’lumot topilmadi',
    });
  }

  // Prisma: takroriy qiymat
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'Bunday ma’lumot allaqachon mavjud',
    });
  }

  const status = err.status || err.statusCode || 500;

  if (status >= 500) {
    console.error(err);

    return res.status(status).json({
      success: false,
      message: 'Server xatoligi',
    });
  }

  return res.status(status).json({
    success: false,
    message: err.message || 'Xatolik yuz berdi',
  });
};

module.exports = {
  notFound,
  errorHandler,
};