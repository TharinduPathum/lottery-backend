import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  roles: string[];
  walletBalance: number; 
  createdAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { 
      type: String, 
      required: [true, "කරුණාකර නම ඇතුළත් කරන්න"] 
    },
    email: { 
      type: String, 
      required: [true, "kරුණාකර ඊමේල් එක ඇතුළත් කරන්න"], 
      unique: true, 
      trim: true 
    },
    passwordHash: { 
      type: String, 
      required: true 
    },
    roles: { 
      type: [String], 
      enum: ["USER", "ADMIN"], 
      default: ["USER"] 
    },
    walletBalance: { 
      type: Number, 
      required: true, 
      default: 0
    }
  },
  { timestamps: true } 
);

export default mongoose.model<IUser>("User", UserSchema);