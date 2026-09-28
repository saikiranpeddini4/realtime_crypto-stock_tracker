import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import app from './app.js';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const requiredEnvironment = ['MONGO_URI', 'JWT_SECRET', 'CLIENT_URL'];
const missingEnvironment = requiredEnvironment.filter((name) => !process.env[name]);

if (isProduction && missingEnvironment.length > 0) {
  throw new Error(`Missing required production environment variables: ${missingEnvironment.join(', ')}`);
}

const PORT = process.env.PORT || 5000;
let server;

const shutdown = async (signal) => {
  console.log(`[Express] ${signal} received, shutting down`);
  server?.close(async () => {
    await mongoose.connection.close();
    process.exit(0);
  });
};

process.once('SIGTERM', () => shutdown('SIGTERM'));
process.once('SIGINT', () => shutdown('SIGINT'));

const startServer = async () => {
  await connectDB();
  server = app.listen(PORT, () => {
    console.log(`[Express] Server running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error(`[Express] Startup failed: ${error.message}`);
  process.exit(1);
});
