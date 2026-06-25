import { Router } from "express";
import { register, login , topUpWallet} from "../controllers/authController";

const router = Router();

router.post("/register", register);

router.post("/login", login);

router.post("/topup", topUpWallet);

export default router;