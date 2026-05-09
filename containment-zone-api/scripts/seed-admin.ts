import * as dotenv from 'dotenv';
import * as path from 'path';
import * as bcrypt from 'bcrypt';
import mongoose from 'mongoose';

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SALT_ROUNDS = 12;

const AdminUserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    last_login_at: { type: Date, default: null },
  },
  { collection: 'admin_users' },
);

const AdminUserModel = mongoose.model('AdminUser', AdminUserSchema);

async function seedAdmin() {
  const mongoUri = process.env.MONGODB_URI;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!mongoUri) {
    console.error('[seed] ERROR: MONGODB_URI is not set in .env');
    process.exit(1);
  }

  if (!adminPassword) {
    console.error('[seed] ERROR: ADMIN_PASSWORD is not set in .env');
    process.exit(1);
  }

  console.log('[seed] Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('[seed] Connected.');

  const passwordHash = await bcrypt.hash(adminPassword, SALT_ROUNDS);
  console.log('[seed] Password hashed with bcrypt (salt rounds: 12)');

  const existing = await AdminUserModel.findOne({ username: 'admin' });

  if (existing) {
    await AdminUserModel.updateOne(
      { username: 'admin' },
      { $set: { password_hash: passwordHash } },
    );
    console.log('[seed] Admin user updated successfully.');
  } else {
    await AdminUserModel.create({
      username: 'admin',
      password_hash: passwordHash,
      last_login_at: null,
    });
    console.log('[seed] Admin user created successfully.');
  }

  await mongoose.disconnect();
  console.log('[seed] Done. Disconnected from MongoDB.');
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error('[seed] Fatal error:', err);
  process.exit(1);
});
