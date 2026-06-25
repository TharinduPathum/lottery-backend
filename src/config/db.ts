import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
  
    const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/lottery_db";
    
    const conn = await mongoose.connect(mongoURI);
    console.log(`🟢 MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`🔴 MongoDB Connection Error: ${(error as Error).message}`);
    process.exit(1); 
  }
};

export default connectDB;