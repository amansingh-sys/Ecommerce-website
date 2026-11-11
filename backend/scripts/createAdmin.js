require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
(async () => {
  try {
    if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI missing. Create backend/.env first.');
    const [email, password, ...nameParts] = process.argv.slice(2);
    const name = nameParts.join(' ') || 'Store Administrator';
    if (!email || !password || password.length < 8) throw new Error('Usage: npm run create-admin -- admin@example.com StrongPassword123 "Admin Name" (password min 8 chars)');
    await mongoose.connect(process.env.MONGODB_URI);
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail }).select('+password');
    if (existing) {
      existing.role = 'admin';
      existing.name = name;
      existing.password = await bcrypt.hash(password, 12);
      await existing.save();
      console.log(`Admin account updated: ${normalizedEmail}`);
    } else {
      await User.create({ name, email: normalizedEmail, password: await bcrypt.hash(password, 12), role: 'admin' });
      console.log(`Admin account created: ${normalizedEmail}`);
    }
  } catch (error) { console.error(error.message); process.exitCode = 1; }
  finally { await mongoose.disconnect(); }
})();
