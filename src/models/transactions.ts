import mongoose, { Schema, Document } from "mongoose";

// 1. TypeScript Interface එක (Code එක ඇතුලේ Types හරියට තියාගන්න)
export interface ITransaction extends Document {
  user: mongoose.Types.ObjectId;
  type: "deposit" | "purchase" | "winning";
  amount: number;
  status: "success" | "pending" | "failed";
  createdAt: Date;
}

// 2. Mongoose Schema එක (MongoDB එකට ඩේටා යන හැඩය)
const TransactionSchema: Schema = new Schema(
  {
    // 👤 ගනුදෙනුව කරපු යූසර්ගේ ID එක (User Model එකට සම්බන්ධයි)
    user: { 
      type: Schema.Types.ObjectId, 
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
  { timestamps: true } 
);

// Model එක Export කිරීම
export default mongoose.model<ITransaction>("Transaction", TransactionSchema);