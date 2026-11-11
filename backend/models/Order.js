const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, name: String, price: Number, quantity: Number, image: String }],
  shippingAddress: { name: String, email: String, phone: String, address: String, city: String, pin: String },
  subtotal: { type: Number, required: true },
  status: { type: String, enum: ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Placed' },
  paymentMethod: { type: String, default: 'Cash on Delivery' }
}, { timestamps: true });
module.exports = mongoose.model('Order', schema);
