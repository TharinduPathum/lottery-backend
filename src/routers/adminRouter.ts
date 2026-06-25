// routes/adminRouter.ts
import { Router } from "express";
import { getDashboardStats, getAdminTransactions } from "../controllers/adminController";

const router = Router();

// 📊 http://localhost:5000/api/admin/dashboard-stats
router.get("/dashboard-stats", getDashboardStats);

// 📑 http://localhost:5000/api/admin/transactions
router.get("/transactions", getAdminTransactions);

export default router;