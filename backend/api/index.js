import dotenv from 'dotenv';
import app from '../app.js';
import connectDB from '../config/db.js';

dotenv.config();

let databaseConnection;

const handler = async (req, res) => {
  if (!databaseConnection) {
    databaseConnection = connectDB().catch((error) => {
      databaseConnection = undefined;
      throw error;
    });
  }

  await databaseConnection;
  return app(req, res);
};

export default handler;
