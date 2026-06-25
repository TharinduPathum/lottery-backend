import { Router } from "express";
import { 
  generateTickets, 
  getAvailableTickets, 
  buyTicket, 
  getMyTickets, 
  drawLottery,
  getPastDrawResults
} from "../controllers/ticketController";

const router = Router();

router.post("/generate", generateTickets);

router.get("/available", getAvailableTickets);

router.post("/buy", buyTicket);

router.get("/my-tickets", getMyTickets);

router.post("/draw", drawLottery); 

router.get("/draw-results", getPastDrawResults); 

export default router;