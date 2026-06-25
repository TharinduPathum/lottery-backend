// controllers/adminController.ts
import { Request, Response } from "express";
import Transaction from "../models/transactions"; 
import User from "../models/userModel";               
import Ticket from "../models/ticketModel";           

// 📊 1. ඩෑෂ්බෝඩ් එකට ලයිව් ස්ටැට්ස් ලබාදීම
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const activeUsers = await User.countDocuments();
    const distinctDraws = await Ticket.distinct("drawDate"); 

    // 🎫 1. සාර්ථකව විකුණුනු ටිකට්ස් වල මුළු එකතුව (Purchases Only)
    const salesData = await Transaction.aggregate([
      { $match: { type: "purchase", status: "success" } },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
    ]);
    const totalSales = salesData.length > 0 ? salesData[0].totalAmount : 0;

    // 💳 2. 🟢 UPDATE: යූසර්ලා සයිට් එකට දාපු මුළු සල්ලි එකතුව (Deposits Only)
    const depositsData = await Transaction.aggregate([
      { $match: { type: "deposit", status: "success" } },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
    ]);
    const totalDeposits = depositsData.length > 0 ? depositsData[0].totalAmount : 0;

    // Frontend එකට totalDeposits එකත් යවනවා
    res.status(200).json({ 
      totalSales, 
      totalDeposits, // 👈 මේක අලුතින් එකතු කළා
      activeUsers, 
      pendingDraws: distinctDraws.length 
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: (error as Error).message });
  }
};

// 📑 2. සියලුම ගනුදෙනු (Transactions) ලැයිස්තුව ලබාදීම
export const getAdminTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const transactions = await Transaction.find()
      .populate("user", "name email") // ගනුදෙනුව කරපු යූසර්ගේ නම සහ ඊමේල් එක ගන්නවා
      .sort({ createdAt: -1 });

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: (error as Error).message });
  }
};