/**
 * Creates or updates a default login for local/dev use.
 * Run: npm run seed:user   (from backend folder)
 */
require('dotenv').config();

const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
if (
  process.env.MONGO_URI?.startsWith('mongodb+srv://') &&
  process.env.MONGO_DNS_SYSTEM !== '1'
) {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
}

const mongoose = require('mongoose');
const User = require('./models/User');

const DEFAULT_EMAIL = 'user@yopmail.com';
const DEFAULT_PASSWORD = 'hello12345';
const DEFAULT_NAME = 'Default User';

async function run() {
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is not set.');
    process.exit(1);
  }

  const connectOpts = process.env.DB_NAME ? { dbName: process.env.DB_NAME } : {};
  await mongoose.connect(process.env.MONGO_URI, connectOpts);

  let user = await User.findOne({ email: DEFAULT_EMAIL }).select('+password');

  if (!user) {
    await User.create({
      name: DEFAULT_NAME,
      email: DEFAULT_EMAIL,
      password: DEFAULT_PASSWORD,
      isVerified: true,
    });
    console.log(`✅ Created default user: ${DEFAULT_EMAIL}`);
  } else {
    user.name = DEFAULT_NAME;
    user.password = DEFAULT_PASSWORD;
    user.isVerified = true;
    await user.save();
    console.log(`✅ Updated default user: ${DEFAULT_EMAIL} (password reset to seed value)`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('❌', err);
  process.exit(1);
});
