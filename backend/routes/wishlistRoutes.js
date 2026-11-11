const router = require('express').Router();
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
router.use(protect);
router.get('/', asyncHandler(async (req, res) => {
  let list = await Wishlist.findOne({ user: req.user._id }).populate('products');
  if (!list) list = await Wishlist.create({ user: req.user._id, products: [] });
  res.json({ wishlist: list });
}));
router.post('/:productId', asyncHandler(async (req, res) => {
  if (!await Product.exists({ _id: req.params.productId, active: true })) return res.status(404).json({ message: 'Product not found.' });
  const list = await Wishlist.findOneAndUpdate({ user: req.user._id }, { $addToSet: { products: req.params.productId } }, { new: true, upsert: true }).populate('products');
  res.json({ wishlist: list });
}));
router.delete('/:productId', asyncHandler(async (req, res) => {
  const list = await Wishlist.findOneAndUpdate({ user: req.user._id }, { $pull: { products: req.params.productId } }, { new: true, upsert: true }).populate('products');
  res.json({ wishlist: list });
}));
module.exports = router;
