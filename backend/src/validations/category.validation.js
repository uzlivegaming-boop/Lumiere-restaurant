
const { z } = require('zod');

const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Kategoriya nomi kamida 2 ta belgidan iborat bo‘lsin'),

  slug: z
    .string()
    .trim()
    .min(2, 'Slug kamida 2 ta belgidan iborat bo‘lsin')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug faqat kichik harflar, raqamlar va tire ishlatsin'
    ),
});

const updateCategorySchema = createCategorySchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: 'Kamida bitta maydon yuboring' }
  );

module.exports = {
  createCategorySchema,
  updateCategorySchema,
};
