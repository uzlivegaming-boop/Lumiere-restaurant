
const express = require('express');

const router = express.Router();

const validate = require('../middlewares/validate');
const requireAdmin = require('../middlewares/adminAuth');

const {
  createCategorySchema,
  updateCategorySchema,
} = require('../validations/category.validation');

const {
  getAllCategories,
  getOneCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/category.controller');

router.get('/', getAllCategories);
router.get('/:id', getOneCategory);

router.post(
  '/',
  requireAdmin,
  validate(createCategorySchema),
  createCategory
);

router.put(
  '/:id',
  requireAdmin,
  validate(updateCategorySchema),
  updateCategory
);

router.delete('/:id', requireAdmin, deleteCategory);

module.exports = router;
