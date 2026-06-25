"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.topUpWallet = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../models/userModel"));
const transactions_1 = __importDefault(require("../models/transactions"));
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userExists = await userModel_1.default.findOne({ email });
        if (userExists) {
            res.status(400).json({ message: "මෙම ඊමේල් ලිපිනය දැනටමත් පද්ධතියේ පවතී." });
            return;
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(password, salt);
        const newUser = await userModel_1.default.create({
            name,
            email,
            passwordHash,
        });
        res.status(201).json({
            message: "ලියාපදිංචි වීම සාර්ථකයි!",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                walletBalance: newUser.walletBalance,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel_1.default.findOne({ email });
        if (!user) {
            res.status(400).json({ message: "ඊමේල් ලිපිනය හෝ මුරපදය වැරදියි." });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            res.status(400).json({ message: "ඊමේල් ලිපිනය හෝ මුරපදය වැරදියි." });
            return;
        }
        const jwtSecret = process.env.JWT_SECRET || "supersecretkey123";
        const token = jsonwebtoken_1.default.sign({ id: user._id, roles: user.roles }, jwtSecret, { expiresIn: "7d" });
        res.status(200).json({
            message: "ඇතුළු වීම සාර්ථකයි!",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                roles: user.roles,
                walletBalance: user.walletBalance,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
exports.login = login;
const topUpWallet = async (req, res) => {
    try {
        const { userId, amount } = req.body;
        // 💰 මුදල ශුන්‍යයට වඩා වැඩිදැයි බැලීම
        if (!amount || amount <= 0) {
            res.status(400).json({ message: "කරුණාකර වලංගු මුදලක් ඇතුළත් කරන්න." });
            return;
        }
        // 🔍 පරිශීලකයා සෙවීම
        const user = await userModel_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ message: "පරිශීලකයා සොයාගත නොහැක." });
            return;
        }
        // 📈 1. යූසර්ගේ පසුම්බියට මුදල් එකතු කර සේව් කිරීම
        user.walletBalance += Number(amount);
        await user.save();
        // 📝 2. 🟢 UPDATE: මුදල් තැන්පතු වාර්තාව (Deposit Transaction) ඩේටාබේස් එකට එකතු කිරීම
        await transactions_1.default.create({
            user: user._id, // සල්ලි දාපු යූසර්ගේ ID එක
            type: "deposit", // ගනුදෙනු වර්ගය සල්ලි දැමීමක් (deposit)
            amount: Number(amount), // එකතු කරපු මුදල
            status: "success" // සාර්ථක නිසා status එක success
        });
        // 🎉 සාර්ථක ප්‍රතිචාරය යැවීම
        res.status(200).json({
            message: `රු. ${amount}/- ක් සාර්ථකව ඔබගේ පසුම්බියට එකතු කරන ලදී!`,
            currentBalance: user.walletBalance,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
exports.topUpWallet = topUpWallet;
