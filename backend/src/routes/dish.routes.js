
const express = require('express');
const router = express.Router();

const requireAdmin = require('../middlewares/adminAuth');

const {
  getAllDishes,
  getOneDish,
  createDish,
  updateDish,
  removeDish,
} = require('../controllers/dishes.controller');

router.get('/', getAllDishes);
router.get('/:id', getOneDish);

router.post('/', requireAdmin, createDish);
router.put('/:id', requireAdmin, updateDish);
router.delete('/:id', requireAdmin, removeDish);

module.exports = router;
