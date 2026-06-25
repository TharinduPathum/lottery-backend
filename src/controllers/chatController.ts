// 1. 🛑 හැමදේටම කලින්, Imports වලටත් කලින් .env එක ලෝඩ් කරන්න!
import dotenv from "dotenv";
dotenv.config(); 

// 2. ඉතිරි Imports ටික සාමාන්‍ය පරිදි
import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import User from "../models/userModel";
import Draw from "../models/draw";

export const handleChatBot = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, message } = req.body;

    if (!message) {
      res.status(400).json({ message: "මැසේජ් එකක් ඇතුළත් කරන්න." });
      return;
    }

    // 🔑 .env එකෙන් කී එක ගන්නවා
    const apiKey = process.env.GEMINI_API_KEY;
    
    // 🔍 ටර්මිනල් එකේ කී එක හරියටම කියවෙනවද බලන්න Print එකක්
    console.log("🔑 කියවගත්තු Gemini Key එක මෙන්න:", apiKey);

    if (!apiKey || apiKey === "ඔයා_copy_කරන්_ආපු_Gemini_API_Key_එක_මෙතනට_දාන්න") {
      console.error("❌ ERROR: .env එකේ ඇත්තම Gemini API Key එකක් දාලා නැහැ හෝ කියවන්න බැහැ!");
      res.status(500).json({ message: "සර්වර් එකේ API Key එක සෙටප් කර නොමැත." });
      return;
    }

    // Gemini Client එක ක්‍රියේට් කිරීම
    const genAI = new GoogleGenerativeAI(apiKey);
const aiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // ඩේටාබේස් එකෙන් ලයිව් Context එක ඇදලා ගැනීම
    const user = userId ? await User.findById(userId) : null;
    const latestDraw = await Draw.findOne().sort({ createdAt: -1 });

    const userBalance = user ? `Rs. ${user.walletBalance}.00` : "ලොග් වී නොමැත";
    const userName = user ? user.name : "පරිශීලකයා";
    const winningNumbers = latestDraw ? latestDraw.winningNumbers.join(", ") : "තාම දිනුම් ඇදීමක් කර නැත";
    const drawDate = latestDraw && (latestDraw as any).createdAt 
      ? new Date((latestDraw as any).createdAt).toLocaleDateString() 
      : "නොදනී";

    // AI සිස්ටම් ප්‍රොම්ප්ට් එක
    const systemPrompt = `
      ඔයා මේ ලොතරැයි වෙබ් අඩවියේ ඉන්න සුහදශීලී AI සහායකයා. ඔයා පරිශීලකයන්ට උදව් කරන්න ඕනේ සිංහල භාෂාවෙන් විතරයි.
      
      මෙන්න ලයිව් දත්ත:
      - යූසර්ගේ නම: ${userName}
      - යූසර්ගේ Wallet Balance: ${userBalance}
      - අවසන් ලොතරැයි දිනුම් අංක 5: [ ${winningNumbers} ]
      - අවසන් දිනුම් ඇදීමේ දිනය: ${drawDate}
      - ටිකට් මිල: Rs. 100.00
    `;

    const result = await aiModel.generateContent([systemPrompt, message]);
    const aiResponse = result.response.text();

    res.status(200).json({ reply: aiResponse });
  } catch (error) {
    console.error("AI Chatbot Error:", error);
    res.status(500).json({ message: "Server Error", error: (error as Error).message });
  }
};