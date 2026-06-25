import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import authRouter from "./routers/authRouter";
import ticketRouter from "./routers/ticketRouter";
import paymentRouter from "./routers/paymentRouter";
import adminRouter from "./routers/adminRouter";
import chatRouter from "./routers/chatRouter";

dotenv.config();

const app = express();

connectDB();

app.use(cors()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

app.use("/api/auth", authRouter);
app.use("/api/tickets", ticketRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/admin", adminRouter);
app.use("/api/chat", chatRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is successfully running on port ${PORT}`);
});