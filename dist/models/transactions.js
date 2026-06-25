"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
// 2. Mongoose Schema එක (MongoDB එකට ඩේටා යන හැඩය)
const TransactionSchema = new mongoose_1.Schema({
    // 👤 ගනුදෙනුව කරපු යූසර්ගේ ID එක (User Model එකට සම්බන්ධයි)
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    // 🏷️ ගනුදෙනු වර්ගය (සල්ලි දැමීම, ටිකට් ගැනීම, දිනුම් මුදල්)
    type: {
        type: String,
        enum: ["deposit", "purchase", "winning"],
        required: true
    },
    // 💰 මුදල
    amount: {
        type: Number,
        required: true
    },
    // ⚡ තත්ත්වය
    status: {
        type: String,
        enum: ["success", "pending", "failed"],
        default: "success"
    }
}, 
// 📅 { timestamps: true } දැම්මම createdAt සහ updatedAt දිනය සහ වෙලාව ඔටෝම හැදෙනවා
{ timestamps: true });
// Model එක Export කිරීම
exports.default = mongoose_1.default.model("Transaction", TransactionSchema);
