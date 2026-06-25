"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const authRouter_1 = __importDefault(require("./routers/authRouter"));
const ticketRouter_1 = __importDefault(require("./routers/ticketRouter"));
const paymentRouter_1 = __importDefault(require("./routers/paymentRouter"));
const adminRouter_1 = __importDefault(require("./routers/adminRouter"));
const chatRouter_1 = __importDefault(require("./routers/chatRouter"));
dotenv_1.default.config();
const app = (0, express_1.default)();
(0, db_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/api/auth", authRouter_1.default);
app.use("/api/tickets", ticketRouter_1.default);
app.use("/api/payments", paymentRouter_1.default);
app.use("/api/admin", adminRouter_1.default);
app.use("/api/chat", chatRouter_1.default);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is successfully running on port ${PORT}`);
});
