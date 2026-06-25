// routes/chatRouter.ts
import { Router } from "express";
import { handleChatBot } from "../controllers/chatController";

const router = Router();

// http://localhost:5000/api/chat
router.post("/", handleChatBot);

export default router;