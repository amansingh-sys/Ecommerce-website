const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');
exports.stats = asyncHandler(async (req, res) => {
  const [users, products, orders, revenue, recentOrders, lowStock] = await Promise.all([
    User.countDocuments({ role: 'customer' }), Product.countDocuments({ active: true }), Order.countDocuments(),
    Order.aggregate([{ $match: { status: { $ne: 'Cancelled' } } }, { $group: { _id: null, total: { $sum: '$subtotal' } } }]),
    Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(6),
    Product.countDocuments({ active: true, stock: { $lte: 5 } })
  ]);
  res.json({ users, products, orders, revenue: revenue[0]?.total || 0, recentOrders, lowStock });
});
exports.products = asyncHandler(async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json({ products });
});
exports.users = asyncHandler(async (req, res) => {
  const users = await User.find({ role: 'customer' }).select('name email createdAt').sort({ createdAt: -1 }).limit(200);
  res.json({ users });
});
