"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paymentController_1 = require("../controllers/paymentController"); // 👈 paymentNotify එකත් Import කරගන්න
const router = (0, express_1.Router)();
router.post("/hash", paymentController_1.getPaymentHash);
router.post("/notify", paymentController_1.paymentNotify);
exports.default = router;
