const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');

const productFields = ['name', 'category', 'price', 'rating', 'tag', 'image', 'desc', 'color', 'stock', 'active'];
function cleanProduct(body) {
  const data = {};
  for (const key of productFields) if (body[key] !== undefined) data[key] = body[key];
  if (data.name !== undefined) data.name = String(data.name).trim();
  if (data.category !== undefined) data.category = String(data.category).trim();
  if (data.image !== undefined) data.image = String(data.image).trim();
  if (data.desc !== undefined) data.desc = String(data.desc).trim();
  if (data.price !== undefined) data.price = Number(data.price);
  if (data.stock !== undefined) data.stock = Number(data.stock);
  if (data.rating !== undefined) data.rating = Number(data.rating);
  return data;
}
exports.list = asyncHandler(async (req, res) => {
  const filter = { active: true };
  if (req.query.category && req.query.category !== 'All') filter.category = req.query.category;
  if (req.query.search) {
    const term = String(req.query.search).slice(0, 80).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = ['name', 'category', 'desc'].map(k => ({ [k]: { $regex: term, $options: 'i' } }));
  }
  let query = Product.find(filter);
  if (req.query.sort === 'low') query = query.sort({ price: 1 });
  else if (req.query.sort === 'high') query = query.sort({ price: -1 });
  else if (req.query.sort === 'rating') query = query.sort({ rating: -1 });
  else query = query.sort({ createdAt: -1 });
  res.json({ products: await query });
});
exports.getOne = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, active: true });
  if (!product) return res.status(404).json({ message: 'Product not found.' });
  res.json({ product });
});
exports.create = asyncHandler(async (req, res) => {
  const data = cleanProduct(req.body);
  if (!data.name || !data.category || !Number.isFinite(data.price) || data.price < 0) return res.status(400).json({ message: 'Name, category and a valid price are required.' });
  const product = await Product.create(data);
  res.status(201).json({ message: 'Product created.', product });
});
exports.update = asyncHandler(async (req, res) => {
  const data = cleanProduct(req.body);
  const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
  if (!product) return res.status(404).json({ message: 'Product not found.' });
  res.json({ message: 'Product updated.', product });
});
exports.archive = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
  if (!product) return res.status(404).json({ message: 'Product not found.' });
  res.json({ message: 'Product archived.' });
});
