
const { z } = require('zod');

const createDishSchema = z.object({
  name: z.string().trim().min(1, 'Taom nomi kerak'),
  slug: z.string().trim().min(1, 'Slug kerak'),
  description: z.string().trim().min(1, 'Tavsif kerak'),
  ingredients: z.array(z.string().trim().min(1)).min(1),
  steps: z.array(z.string().trim().min(1)).min(1),
  price: z.coerce.number().positive('Narx musbat bo‘lishi kerak'),
  image: z.string().trim().min(1, 'Rasm manzili kerak'),
  categoryId: z.string().trim().min(1, 'Kategoriya tanlanishi kerak'),
  isAvailable: z.boolean().optional(),
});

const updateDishSchema = createDishSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Yangilash uchun kamida bitta maydon kiriting' }
);

module.exports = {
  createDishSchema,
  updateDishSchema,
};