import mongoose, { Schema, Document } from "mongoose";

export interface IDraw extends Document {
  winningNumbers: number[];
  drawDate: Date;
  summary: {
    checkedTickets: number;
    totalWinners: number;
    totalPayout: string;
    breakdown: {
      count5000: number;
      count1000: number;
      count500: number;
      count200: number;
      count100: number;
    };
  };
}

const DrawSchema: Schema = new Schema({
  winningNumbers: { type: [Number], required: true },
  drawDate: { type: Date, default: Date.now },
  summary: {
    checkedTickets: { type: Number, required: true },
    totalWinners: { type: Number, required: true },
    totalPayout: { type: String, required: true },
    breakdown: {
      count5000: { type: Number, default: 0 },
      count1000: { type: Number, default: 0 },
      count500: { type: Number, default: 0 },
      count200: { type: Number, default: 0 },
      count100: { type: Number, default: 0 },
    }
  }
});

export default mongoose.model<IDraw>("Draw", DrawSchema);