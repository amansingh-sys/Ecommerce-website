const router = require('express').Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
router.use(protect);
async function getCart(userId) {
  let cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
}
router.get('/', asyncHandler(async (req, res) => res.json({ cart: await getCart(req.user._id) })));
router.post('/', asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty < 1 || qty > 20) return res.status(400).json({ message: 'Quantity must be between 1 and 20.' });
  const product = await Product.findOne({ _id: productId, active: true });
  if (!product) return res.status(404).json({ message: 'Product not found.' });
  if (product.stock < qty) return res.status(400).json({ message: 'Not enough stock available.' });
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
  const item = cart.items.find(x => x.product.toString() === productId);
  if (item) item.quantity = Math.min(20, item.quantity + qty);
  else cart.items.push({ product: productId, quantity: qty });
  await cart.save();
  res.json({ cart: await getCart(req.user._id) });
}));
router.patch('/:productId', asyncHandler(async (req, res) => {
  const qty = Number(req.body.quantity);
  if (!Number.isInteger(qty) || qty < 1 || qty > 20) return res.status(400).json({ message: 'Quantity must be between 1 and 20.' });
  const cart = await Cart.findOne({ user: req.user._id });
  const item = cart?.items.find(x => x.product.toString() === req.params.productId);
  if (!item) return res.status(404).json({ message: 'Cart item not found.' });
  item.quantity = qty; await cart.save();
  res.json({ cart: await getCart(req.user._id) });
}));
router.delete('/:productId', asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) { cart.items = cart.items.filter(x => x.product.toString() !== req.params.productId); await cart.save(); }
  res.json({ cart: await getCart(req.user._id) });
}));
router.delete('/', asyncHandler(async (req, res) => { await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] }); res.json({ message: 'Cart cleared.' }); }));
module.exports = router;
