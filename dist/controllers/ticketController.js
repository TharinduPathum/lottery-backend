"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPastDrawResults = exports.getAllTransactions = exports.drawLottery = exports.getMyTickets = exports.buyTicket = exports.getAvailableTickets = exports.generateTickets = void 0;
const ticketModel_1 = __importDefault(require("../models/ticketModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
const draw_1 = __importDefault(require("../models/draw"));
const transactions_1 = __importDefault(require("../models/transactions"));
const generateTickets = async (req, res) => {
    try {
        const ticketsToCreate = [];
        const drawDate = "2026-06-25";
        for (let i = 0; i < 100; i++) {
            const randomId = Math.floor(10000 + Math.random() * 90000);
            const ticketNumber = `LOTT-${Date.now().toString().slice(-4)}-${randomId}`;
            const luckyNumbers = [];
            while (luckyNumbers.length < 5) {
                const num = Math.floor(Math.random() * 49) + 1;
                if (!luckyNumbers.includes(num)) {
                    luckyNumbers.push(num);
                }
            }
            ticketsToCreate.push({
                ticketNumber,
                luckyNumbers,
                price: 100,
                status: "available",
                drawDate,
            });
        }
        await ticketModel_1.default.insertMany(ticketsToCreate, { ordered: false });
        res
            .status(201)
            .json({
            message: "වාසනාවන්ත ලොතරැයි ටිකට්පත් 100ක් සාර්ථකව පද්ධතියට එකතු කරන ලදී!",
        });
    }
    catch (error) {
        console.error("❌ TICKET GENERATION ERROR DETECTED:", error);
        res.status(500).json({
            message: "Server Error",
            error: error.message,
        });
    }
};
exports.generateTickets = generateTickets;
const getAvailableTickets = async (req, res) => {
    try {
        const tickets = await ticketModel_1.default.find({ status: "available" });
        res.status(200).json(tickets);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Server Error", error: error.message });
    }
};
exports.getAvailableTickets = getAvailableTickets;
const buyTicket = async (req, res) => {
    try {
        const { userId, ticketId } = req.body;
        // 🔍 පරිශීලකයා සෙවීම
        const user = await userModel_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ message: "පරිශීලකයා සොයාගත නොහැක." });
            return;
        }
        // 🎫 ලොතරැයි පත සෙවීම
        const ticket = await ticketModel_1.default.findById(ticketId);
        if (!ticket) {
            res.status(404).json({ message: "ලොතරැයි පත සොයාගත නොහැක." });
            return;
        }
        // 🚫 දැනටමත් විකිණිලාදැයි බැලීම
        if (ticket.status === "sold") {
            res
                .status(400)
                .json({
                message: "කණගාටුයි! මෙම ලොතරැයි පත දැනටමත් වෙනත් අයෙකු මිලදී ගෙන ඇත.",
            });
            return;
        }
        // 💰 පසුම්බියේ මුදල් තිබේදැයි බැලීම
        if (user.walletBalance < ticket.price) {
            res
                .status(400)
                .json({
                message: "ඔබගේ පසුම්බියේ (Wallet) ප්‍රමාණවත් මුදල් නොමැත. කරුණාකර Top-up කරන්න.",
            });
            return;
        }
        // 📉 1. යූසර්ගේ බැලන්ස් එක අඩු කර සේව් කිරීම
        user.walletBalance -= ticket.price;
        await user.save();
        // 🏷️ 2. ටිකට් එක විකුණූ ලෙස අප්ඩේට් කර සේව් කිරීම
        ticket.status = "sold";
        ticket.userId = user._id;
        await ticket.save();
        // 📝 3. 🟢 UPDATE: ගනුදෙනු වාර්තාව (Transaction) ඩේටාබේස් එකට එකතු කිරීම
        await transactions_1.default.create({
            user: user._id, // ටිකට් එක ගත්තු යූසර්ගේ ID එක
            type: "purchase", // ගනුදෙනු වර්ගය ටිකට් මිලදී ගැනීමක් (purchase)
            amount: ticket.price, // කැපුනු මුදල (රු. 100)
            status: "success", // සාර්ථක නිසා status එක success
        });
        // 🎉 සාර්ථක ප්‍රතිචාරය යැවීම
        res.status(200).json({
            message: "ලොතරැයි පත මිලදී ගැනීම සාර්ථකයි! වාසනාව උදාවේවා!",
            currentBalance: user.walletBalance,
            purchasedTicket: ticket,
        });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Server Error", error: error.message });
    }
};
exports.buyTicket = buyTicket;
const getMyTickets = async (req, res) => {
    try {
        const userId = req.user?.id || req.headers["user-id"];
        if (!userId) {
            res.status(400).json({ message: "User ID is required" });
            return;
        }
        const myTickets = await ticketModel_1.default.find({ userId: userId });
        res.status(200).json(myTickets);
    }
    catch (error) {
        console.error("Error fetching user tickets:", error);
        res.status(500).json({ message: "Server Error" });
    }
};
exports.getMyTickets = getMyTickets;
const drawLottery = async (req, res) => {
    try {
        const { winningNumbers: rawNumbers } = req.body; // 👈 මුලින්ම rawNumbers විදිහට ගන්න
        if (!rawNumbers || !Array.isArray(rawNumbers) || rawNumbers.length !== 5) {
            res.status(400).json({ message: "කරුණාකර නිවැරදි දිනුම් අංක 5 ඇතුළත් කරන්න." });
            return;
        }
        // 🔄 🟢 UPDATE: හැම එකක්ම අනිවාර්යයෙන්ම Number එකක් බවට පත් කරනවා (String ටික Number කරනවා)
        const winningNumbers = rawNumbers.map(Number);
        const soldTickets = await ticketModel_1.default.find({ status: "sold" });
        let totalWinners = 0;
        let totalPayout = 0;
        let count5000 = 0, count1000 = 0, count500 = 0, count200 = 0, count100 = 0;
        for (const ticket of soldTickets) {
            // 🎯 දැන් මෙතන Number to Number චෙක් වෙන නිසා සුපිරියටම මැච් වෙනවා!
            const matches = ticket.luckyNumbers.filter((num) => winningNumbers.includes(num)).length;
            let prizeMoney = 0;
            if (matches === 5) {
                prizeMoney = 5000;
                count5000++;
            }
            else if (matches === 4) {
                prizeMoney = 1000;
                count1000++;
            }
            else if (matches === 3) {
                prizeMoney = 500;
                count500++;
            }
            else if (matches === 2) {
                prizeMoney = 200;
                count200++;
            }
            else if (matches === 1) {
                prizeMoney = 100;
                count100++;
            }
            if (prizeMoney > 0) {
                totalWinners++;
                totalPayout += prizeMoney;
                // 🆔 ටිකට් මොඩල් එකේ තියෙන්නේ userId නිසා මේක හරියටම වැඩ කරනවා
                await userModel_1.default.findByIdAndUpdate(ticket.userId, {
                    $inc: { walletBalance: prizeMoney }
                });
                // 📝 ට්‍රාන්සැක්ෂන් එක ඩේටාබේස් එකට දානවා
                await transactions_1.default.create({
                    user: ticket.userId,
                    type: "winning",
                    amount: prizeMoney,
                    status: "success"
                });
                ticket.status = "won";
                ticket.prizeWon = prizeMoney;
            }
            else {
                ticket.status = "lost";
            }
            await ticket.save();
        }
        // ... ඉතිරි කෝඩ් කෑල්ල සාමාන්‍ය පරිදි තියෙන්න හැරිය හැක ...
        await ticketModel_1.default.updateMany({ status: "available" }, { $set: { status: "expired" } });
        const newDrawResult = new draw_1.default({
            winningNumbers,
            summary: {
                checkedTickets: soldTickets.length,
                totalWinners,
                totalPayout: `Rs. ${totalPayout}.00`,
                breakdown: { count5000, count1000, count500, count200, count100 },
            },
        });
        await newDrawResult.save();
        res.status(200).json({
            message: "ලොතරැයිය සාර්ථකව අදින ලදී!",
            summary: {
                checkedTickets: soldTickets.length,
                totalWinners,
                totalPayout: `Rs. ${totalPayout}.00`,
                breakdown: { count5000, count1000, count500, count200, count100 },
            },
        });
    }
    catch (error) {
        console.error("Error drawing lottery:", error);
        res.status(500).json({ message: "Server Error" });
    }
};
exports.drawLottery = drawLottery;
const getAllTransactions = async (req, res) => {
    try {
        const transactions = await ticketModel_1.default.find({
            status: { $ne: "available" },
        }).populate("userId", "name email");
        res.status(200).json(transactions);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching transactions" });
    }
};
exports.getAllTransactions = getAllTransactions;
const getPastDrawResults = async (req, res) => {
    try {
        const draws = await draw_1.default.find().sort({ drawDate: -1 });
        res.status(200).json(draws);
    }
    catch (error) {
        console.error("Error fetching draw results:", error);
        res.status(500).json({ message: "Server Error" });
    }
};
exports.getPastDrawResults = getPastDrawResults;
