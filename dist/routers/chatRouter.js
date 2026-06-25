"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/chatRouter.ts
const express_1 = require("express");
const chatController_1 = require("../controllers/chatController");
const router = (0, express_1.Router)();
// http://localhost:5000/api/chat
router.post("/", chatController_1.handleChatBot);
exports.default = router;
