const prisma = require('../prisma');

const getAllDishes = async (req, res, next) => {
  try {
    const dishes = await prisma.dish.findMany({
      include: {
        category: true,
        ratings: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json({
      success: true,
      data: dishes,
    });
  } catch (error) {
    next(error);
  }
};

const getOneDish = async (req, res, next) => {
  try {
    const dish = await prisma.dish.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        category: true,
        ratings: true,
      },
    });

    if (!dish) {
      return res.status(404).json({
        success: false,
        message: 'Taom topilmadi',
      });
    }

    return res.status(200).json({
      success: true,
      data: dish,
    });
  } catch (error) {
    next(error);
  }
};

const createDish = async (req, res, next) => {
  try {
    const {
      name,
      slug,
      description,
      ingredients,
      steps,
      price,
      image,
      categoryId,
      isAvailable,
    } = req.body;

    if (
      typeof name !== 'string' ||
      !name.trim() ||
      typeof slug !== 'string' ||
      !slug.trim() ||
      typeof description !== 'string' ||
      !description.trim() ||
      !Array.isArray(ingredients) ||
      !Array.isArray(steps) ||
      !categoryId ||
      typeof image !== 'string' ||
      !image.trim() ||
      price === undefined ||
      price === null ||
      price === '' ||
      !Number.isFinite(Number(price)) ||
      Number(price) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Taom ma’lumotlarini to‘liq va to‘g‘ri kiriting',
      });
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategoriya topilmadi',
      });
    }

    const dish = await prisma.dish.create({
      data: {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        ingredients,
        steps,
        price: Number(price),
        image: image.trim(),
        categoryId,
        isAvailable: isAvailable === undefined ? true : isAvailable,
      },
      include: {
        category: true,
        ratings: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Taom muvaffaqiyatli qo‘shildi',
      data: dish,
    });
  } catch (error) {
    next(error);
  }
};

const updateDish = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      description,
      ingredients,
      steps,
      price,
      image,
      categoryId,
      isAvailable,
    } = req.body;

    const existingDish = await prisma.dish.findUnique({
      where: { id },
    });

    if (!existingDish) {
      return res.status(404).json({
        success: false,
        message: 'Taom topilmadi',
      });
    }

    if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Taom nomi noto‘g‘ri',
      });
    }

    if (slug !== undefined && (typeof slug !== 'string' || !slug.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Taom slug qiymati noto‘g‘ri',
      });
    }

    if (
      description !== undefined &&
      (typeof description !== 'string' || !description.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: 'Taom tavsifi noto‘g‘ri',
      });
    }

    if (ingredients !== undefined && !Array.isArray(ingredients)) {
      return res.status(400).json({
        success: false,
        message: 'Masalliqlar ro‘yxati noto‘g‘ri',
      });
    }

    if (steps !== undefined && !Array.isArray(steps)) {
      return res.status(400).json({
        success: false,
        message: 'Tayyorlash bosqichlari noto‘g‘ri',
      });
    }

    if (
      price !== undefined &&
      (price === '' ||
        !Number.isFinite(Number(price)) ||
        Number(price) <= 0)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Taom narxi noto‘g‘ri',
      });
    }

    if (image !== undefined && (typeof image !== 'string' || !image.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Taom rasmi manzili noto‘g‘ri',
      });
    }

    if (isAvailable !== undefined && typeof isAvailable !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Taom mavjudligi true yoki false bo‘lishi kerak',
      });
    }

    if (categoryId !== undefined) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Kategoriya topilmadi',
        });
      }
    }

    const data = {};

    if (name !== undefined) data.name = name.trim();
    if (slug !== undefined) data.slug = slug.trim();
    if (description !== undefined) data.description = description.trim();
    if (ingredients !== undefined) data.ingredients = ingredients;
    if (steps !== undefined) data.steps = steps;
    if (price !== undefined) data.price = Number(price);
    if (image !== undefined) data.image = image.trim();
    if (categoryId !== undefined) data.categoryId = categoryId;
    if (isAvailable !== undefined) data.isAvailable = isAvailable;

    const dish = await prisma.dish.update({
      where: { id },
      data,
      include: {
        category: true,
        ratings: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Taom muvaffaqiyatli yangilandi',
      data: dish,
    });
  } catch (error) {
    next(error);
  }
};

const removeDish = async (req, res, next) => {
  try {
    const { id } = req.params;

    const dish = await prisma.dish.findUnique({
      where: { id },
    });

    if (!dish) {
      return res.status(404).json({
        success: false,
        message: 'Taom topilmadi',
      });
    }

    await prisma.dish.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: 'Taom muvaffaqiyatli o‘chirildi',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDishes,
  getOneDish,
  createDish,
  updateDish,
  removeDish,
};