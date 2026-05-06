import jwt from "jsonwebtoken";
import { User } from "../model/userModel.js";

export const isLogin = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token)
      return res
        .status(401)
        .json({ success: false, message: "User unauthorized:❌" });

    const decode = jwt.verify(token, process.env.JWT_SECRET);
    if (!decode)
      return res
        .status(401)
        .json({ success: false, message: "Invalid token:❌" });

    const user = await User.findById(decode.userId).select("-password");
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "User not found:❌" });
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
