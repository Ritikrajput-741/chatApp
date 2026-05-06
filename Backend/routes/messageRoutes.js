import express from "express";
import { getMessage, getUnreadCount, markSeen, sendMessage } from "../controllers/messageControllers.js";
import { isLogin } from "../middleware/isLogin.js";

const router = express.Router();

router.post("/send/:id", isLogin, sendMessage);
router.get("/:id", isLogin, getMessage);
router.put("/seen/:messageId", isLogin, markSeen);
router.get("/unread/count", isLogin, getUnreadCount); 

export default router;
