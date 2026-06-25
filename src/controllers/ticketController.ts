import { Request, Response } from "express";
import Ticket from "../models/ticketModel";
import User from "../models/userModel";
import Draw from "../models/draw";
import Transaction from "../models/transactions";

export const generateTickets = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const ticketsToCreate = [];
    const drawDate = "2026-06-25";

    for (let i = 0; i < 100; i++) {
      const randomId = Math.floor(10000 + Math.random() * 90000);
      const ticketNumber = `LOTT-${Date.now().toString().slice(-4)}-${randomId}`;

      const luckyNumbers: number[] = [];
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

    await Ticket.insertMany(ticketsToCreate, { ordered: false });

    res
      .status(201)
      .json({
        message:
          "වාසනාවන්ත ලොතරැයි ටිකට්පත් 100ක් සාර්ථකව පද්ධතියට එකතු කරන ලදී!",
      });
  } catch (error) {
    console.error("❌ TICKET GENERATION ERROR DETECTED:", error);

    res.status(500).json({
      message: "Server Error",
      error: (error as Error).message,
    });
  }
};
export const getAvailableTickets = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const tickets = await Ticket.find({ status: "available" });
    res.status(200).json(tickets);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server Error", error: (error as Error).message });
  }
};

export const buyTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, ticketId } = req.body;

    // 🔍 පරිශීලකයා සෙවීම
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "පරිශීලකයා සොයාගත නොහැක." });
      return;
    }

    // 🎫 ලොතරැයි පත සෙවීම
    const ticket = await Ticket.findById(ticketId);
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
          message:
            "ඔබගේ පසුම්බියේ (Wallet) ප්‍රමාණවත් මුදල් නොමැත. කරුණාකර Top-up කරන්න.",
        });
      return;
    }

    // 📉 1. යූසර්ගේ බැලන්ස් එක අඩු කර සේව් කිරීම
    user.walletBalance -= ticket.price;
    await user.save();

    // 🏷️ 2. ටිකට් එක විකුණූ ලෙස අප්ඩේට් කර සේව් කිරීම
    ticket.status = "sold";
    ticket.userId = user._id as any;
    await ticket.save();

    // 📝 3. 🟢 UPDATE: ගනුදෙනු වාර්තාව (Transaction) ඩේටාබේස් එකට එකතු කිරීම
    await Transaction.create({
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
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server Error", error: (error as Error).message });
  }
};

export const getMyTickets = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as any).user?.id || req.headers["user-id"];

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    const myTickets = await Ticket.find({ userId: userId });
    res.status(200).json(myTickets);
  } catch (error) {
    console.error("Error fetching user tickets:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const drawLottery = async (req: Request, res: Response): Promise<void> => {
  try {
    const { winningNumbers: rawNumbers } = req.body; // 👈 මුලින්ම rawNumbers විදිහට ගන්න

    if (!rawNumbers || !Array.isArray(rawNumbers) || rawNumbers.length !== 5) {
       res.status(400).json({ message: "කරුණාකර නිවැරදි දිනුම් අංක 5 ඇතුළත් කරන්න." });
       return;
    }

    // 🔄 🟢 UPDATE: හැම එකක්ම අනිවාර්යයෙන්ම Number එකක් බවට පත් කරනවා (String ටික Number කරනවා)
    const winningNumbers = rawNumbers.map(Number);

    const soldTickets = await Ticket.find({ status: "sold" });

    let totalWinners = 0;
    let totalPayout = 0;
    let count5000 = 0, count1000 = 0, count500 = 0, count200 = 0, count100 = 0;

    for (const ticket of soldTickets) {
      // 🎯 දැන් මෙතන Number to Number චෙක් වෙන නිසා සුපිරියටම මැච් වෙනවා!
      const matches = ticket.luckyNumbers.filter((num: number) => winningNumbers.includes(num)).length;

      let prizeMoney = 0;
      if (matches === 5) { prizeMoney = 5000; count5000++; } 
      else if (matches === 4) { prizeMoney = 1000; count1000++; } 
      else if (matches === 3) { prizeMoney = 500; count500++; } 
      else if (matches === 2) { prizeMoney = 200; count200++; } 
      else if (matches === 1) { prizeMoney = 100; count100++; }

      if (prizeMoney > 0) {
        totalWinners++;
        totalPayout += prizeMoney;

        // 🆔 ටිකට් මොඩල් එකේ තියෙන්නේ userId නිසා මේක හරියටම වැඩ කරනවා
        await User.findByIdAndUpdate(ticket.userId, {
          $inc: { walletBalance: prizeMoney }
        });

        // 📝 ට්‍රාන්සැක්ෂන් එක ඩේටාබේස් එකට දානවා
        await Transaction.create({
          user: ticket.userId!,      
          type: "winning",         
          amount: prizeMoney,       
          status: "success"        
        });

        (ticket as any).status = "won";
        (ticket as any).prizeWon = prizeMoney; 
      } else {
        (ticket as any).status = "lost";
      }
      await ticket.save();
    }

    // ... ඉතිරි කෝඩ් කෑල්ල සාමාන්‍ය පරිදි තියෙන්න හැරිය හැක ...

    await Ticket.updateMany(
      { status: "available" },
      { $set: { status: "expired" } },
    );

    const newDrawResult = new Draw({
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
  } catch (error) {
    console.error("Error drawing lottery:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getAllTransactions = async (req: Request, res: Response) => {
  try {
    const transactions = await Ticket.find({
      status: { $ne: "available" },
    }).populate("userId", "name email");
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching transactions" });
  }
};

export const getPastDrawResults = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const draws = await Draw.find().sort({ drawDate: -1 });
    res.status(200).json(draws);
  } catch (error) {
    console.error("Error fetching draw results:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
