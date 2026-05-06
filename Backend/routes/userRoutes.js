import express from "express";
import { isLogin } from "../middleware/isLogin.js";
import {
  getCurrentChatter,
  serachUser,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/search", isLogin, serachUser);
router.get("/currentchatter", isLogin, getCurrentChatter);

export default router;
