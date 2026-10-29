
const prisma = require('../prisma');

async function getAllCategories(req, res, next) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { dishes: true },
        },
      },
    });

    return res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
}

async function getOneCategory(req, res, next) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
      include: {
        dishes: {
          where: { isAvailable: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategoriya topilmadi',
      });
    }

    return res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
}

async function createCategory(req, res, next) {
  try {
    const category = await prisma.category.create({
      data: {
        name: req.body.name,
        slug: req.body.slug,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Kategoriya yaratildi',
      data: category,
    });
  } catch (error) {
    next(error);
  }
}

async function updateCategory(req, res, next) {
  try {
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: req.body,
    });

    return res.json({
      success: true,
      message: 'Kategoriya yangilandi',
      data: category,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteCategory(req, res, next) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
      include: {
        _count: {
          select: { dishes: true },
        },
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategoriya topilmadi',
      });
    }

    if (category._count.dishes > 0) {
      return res.status(409).json({
        success: false,
        message: 'Bu kategoriyada taomlar bor. Avval ularni boshqa kategoriyaga o‘tkazing.',
      });
    }

    await prisma.category.delete({
      where: { id: req.params.id },
    });

    return res.json({
      success: true,
      message: 'Kategoriya o‘chirildi',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllCategories,
  getOneCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
