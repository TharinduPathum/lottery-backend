"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminTransactions = exports.getDashboardStats = void 0;
const transactions_1 = __importDefault(require("../models/transactions"));
const userModel_1 = __importDefault(require("../models/userModel"));
const ticketModel_1 = __importDefault(require("../models/ticketModel"));
// 📊 1. ඩෑෂ්බෝඩ් එකට ලයිව් ස්ටැට්ස් ලබාදීම
const getDashboardStats = async (req, res) => {
    try {
        const activeUsers = await userModel_1.default.countDocuments();
        const distinctDraws = await ticketModel_1.default.distinct("drawDate");
        // 🎫 1. සාර්ථකව විකුණුනු ටිකට්ස් වල මුළු එකතුව (Purchases Only)
        const salesData = await transactions_1.default.aggregate([
            { $match: { type: "purchase", status: "success" } },
            { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
        ]);
        const totalSales = salesData.length > 0 ? salesData[0].totalAmount : 0;
        // 💳 2. 🟢 UPDATE: යූසර්ලා සයිට් එකට දාපු මුළු සල්ලි එකතුව (Deposits Only)
        const depositsData = await transactions_1.default.aggregate([
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
    }
    catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
exports.getDashboardStats = getDashboardStats;
// 📑 2. සියලුම ගනුදෙනු (Transactions) ලැයිස්තුව ලබාදීම
const getAdminTransactions = async (req, res) => {
    try {
        const transactions = await transactions_1.default.find()
            .populate("user", "name email") // ගනුදෙනුව කරපු යූසර්ගේ නම සහ ඊමේල් එක ගන්නවා
            .sort({ createdAt: -1 });
        res.status(200).json(transactions);
    }
    catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
exports.getAdminTransactions = getAdminTransactions;
