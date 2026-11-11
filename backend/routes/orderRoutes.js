const router = require('express').Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect, adminOnly } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
router.use(protect);
router.post('/', asyncHandler(async (req, res) => {
  const { name, email, phone, address, city, pin } = req.body;
  if (![name, email, phone, address, city, pin].every(v => String(v || '').trim())) return res.status(400).json({ message: 'Please provide complete delivery details.' });
  if (!/^\d{6}$/.test(pin)) return res.status(400).json({ message: 'PIN code must be 6 digits.' });
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart?.items.length) return res.status(400).json({ message: 'Your cart is empty.' });
  const items = [];
  let subtotal = 0;
  for (const row of cart.items) {
    const product = await Product.findById(row.product._id);
    if (!product || !product.active || product.stock < row.quantity) return res.status(400).json({ message: `${row.product.name} is unavailable in the requested quantity.` });
    items.push({ product: product._id, name: product.name, price: product.price, quantity: row.quantity, image: product.image });
    subtotal += product.price * row.quantity;
  }
  for (const row of cart.items) await Product.updateOne({ _id: row.product._id }, { $inc: { stock: -row.quantity } });
  const order = await Order.create({ user: req.user._id, items, subtotal, shippingAddress: { name, email, phone, address, city, pin }, paymentMethod: 'Cash on Delivery' });
  cart.items = []; await cart.save();
  res.status(201).json({ message: 'Order placed successfully.', order });
}));
router.get('/my', asyncHandler(async (req, res) => res.json({ orders: await Order.find({ user: req.user._id }).sort({ createdAt: -1 }) })));
router.get('/', adminOnly, asyncHandler(async (req, res) => res.json({ orders: await Order.find().populate('user', 'name email').sort({ createdAt: -1 }) })));
router.patch('/:id/status', adminOnly, asyncHandler(async (req, res) => {
  const allowed = ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ message: 'Invalid order status.' });
  const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!order) return res.status(404).json({ message: 'Order not found.' });
  res.json({ order });
}));
module.exports = router;
