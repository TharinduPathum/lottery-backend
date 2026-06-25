import { Router } from "express";
import { getPaymentHash, paymentNotify } from "../controllers/paymentController"; // 👈 paymentNotify එකත් Import කරගන්න

const router = Router();


router.post("/hash", getPaymentHash);

router.post("/notify", paymentNotify);

export default router;