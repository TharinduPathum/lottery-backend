import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel";
import Transaction from "../models/transactions";


export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

   
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: "මෙම ඊමේල් ලිපිනය දැනටමත් පද්ධතියේ පවතී." });
      return;
    }

    
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    
    const newUser = await User.create({
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
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: (error as Error).message });
  }
};


export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "ඊමේල් ලිපිනය හෝ මුරපදය වැරදියි." });
      return;
    }

    
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ message: "ඊමේල් ලිපිනය හෝ මුරපදය වැරදියි." });
      return;
    }

    
    const jwtSecret = process.env.JWT_SECRET || "supersecretkey123";
    const token = jwt.sign(
      { id: user._id, roles: user.roles },
      jwtSecret,
      { expiresIn: "7d" }
    );

    
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
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: (error as Error).message });
  }
};


export const topUpWallet = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, amount } = req.body;

    // 💰 මුදල ශුන්‍යයට වඩා වැඩිදැයි බැලීම
    if (!amount || amount <= 0) {
      res.status(400).json({ message: "කරුණාකර වලංගු මුදලක් ඇතුළත් කරන්න." });
      return;
    }

    // 🔍 පරිශීලකයා සෙවීම
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "පරිශීලකයා සොයාගත නොහැක." });
      return;
    }

    // 📈 1. යූසර්ගේ පසුම්බියට මුදල් එකතු කර සේව් කිරීම
    user.walletBalance += Number(amount);
    await user.save();

    // 📝 2. 🟢 UPDATE: මුදල් තැන්පතු වාර්තාව (Deposit Transaction) ඩේටාබේස් එකට එකතු කිරීම
    await Transaction.create({
      user: user._id,          // සල්ලි දාපු යූසර්ගේ ID එක
      type: "deposit",         // ගනුදෙනු වර්ගය සල්ලි දැමීමක් (deposit)
      amount: Number(amount),  // එකතු කරපු මුදල
      status: "success"        // සාර්ථක නිසා status එක success
    });

    // 🎉 සාර්ථක ප්‍රතිචාරය යැවීම
    res.status(200).json({
      message: `රු. ${amount}/- ක් සාර්ථකව ඔබගේ පසුම්බියට එකතු කරන ලදී!`,
      currentBalance: user.walletBalance,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: (error as Error).message });
  }
};