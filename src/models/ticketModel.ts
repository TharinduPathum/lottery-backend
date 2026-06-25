import mongoose, { Schema, Document } from "mongoose";

// 1. TypeScript Interface එක
export interface ITicket extends Document {
  ticketNumber: string;  
  luckyNumbers: number[];  
  price: number;           
  status: "available" | "sold"; 
  userId: mongoose.Types.ObjectId | null; 
  drawDate: string;      
}


const TicketSchema: Schema = new Schema(
  {
    ticketNumber: { 
      type: String, 
      required: true, 
      unique: true 
    },
    luckyNumbers: { 
      type: [Number], 
      required: true 
    },
    price: { 
      type: Number, 
      required: true, 
      default: 100 
    },
    status: { 
      type: String, 
      enum: ["available", "sold" , "won", "lost", "archieved", "expired"], 
      default: "available" 
    },
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      default: null 
    },
    drawDate: { 
      type: String, 
      required: true 
    }
  },
  { timestamps: true }
);

export default mongoose.model<ITicket>("Ticket", TicketSchema);