"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/adminRouter.ts
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const router = (0, express_1.Router)();
// 📊 http://localhost:5000/api/admin/dashboard-stats
router.get("/dashboard-stats", adminController_1.getDashboardStats);
// 📑 http://localhost:5000/api/admin/transactions
router.get("/transactions", adminController_1.getAdminTransactions);
exports.default = router;
