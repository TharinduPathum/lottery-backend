"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentNotify = exports.getPaymentHash = void 0;
const crypto_1 = __importDefault(require("crypto"));
const userModel_1 = __importDefault(require("../models/userModel"));
const getPaymentHash = async (req, res) => {
    const { orderId, amount } = req.body;
    const merchantId = process.env.PAYHERE_MERCHANT_ID || "1234795";
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || "MTM2OTYwNzkyNzM2MzA5MzM4MTQwNDU2MzcwNjkzOTc1MTQ4MTc=";
    const currency = "LKR";
    console.log("LOG -> Merchant ID:", merchantId);
    console.log("LOG -> Merchant Secret Exists?:", merchantSecret ? "YES" : "NO");
    const hashedSecret = crypto_1.default.createHash("md5").update(merchantSecret).digest("hex").toUpperCase();
    const hash = crypto_1.default.createHash("md5")
        .update(merchantId + orderId + Number(amount).toFixed(2) + currency + hashedSecret)
        .digest("hex")
        .toUpperCase();
    res.status(200).json({ hash, merchantId });
};
exports.getPaymentHash = getPaymentHash;
const paymentNotify = async (req, res) => {
    try {
        const { status_code, payhere_amount, custom_1 } = req.body;
        if (status_code === "2") {
            const userId = custom_1;
            const amountToAdd = Number(payhere_amount);
            const user = await userModel_1.default.findById(userId);
            if (user) {
                user.walletBalance += amountToAdd;
                await user.save();
                console.log(`💰 [SUCCESS] Rs.${amountToAdd} added to User: ${user.name}`);
            }
            else {
                console.log("❌ User not found in database");
            }
        }
        res.sendStatus(200);
    }
    catch (error) {
        console.error("Notification Error:", error);
        res.sendStatus(500);
    }
};
exports.paymentNotify = paymentNotify;
// export const topUpWallet = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { userId, amount } = req.body;
//     if (!amount || amount <= 0) {
//       res.status(400).json({ message: "කරුණාකර වලංගු මුදලක් ඇතුළත් කරන්න." });
//       return;
//     }
//     const user = await User.findById(userId);
//     if (!user) {
//       res.status(404).json({ message: "පරිශීලකයා සොයාගත නොහැක." });
//       return;
//     }
//     user.walletBalance += Number(amount);
//     await user.save();
//     res.status(200).json({
//       message: `රු. ${amount}/- ක් සාර්ථකව ඔබගේ පසුම්බියට එකතු කරන ලදී!`,
//       currentBalance: user.walletBalance,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server Error", error: (error as Error).message });
//   }
// };
