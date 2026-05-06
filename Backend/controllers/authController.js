import { User } from "../model/userModel.js";
import bcrypt from "bcryptjs";
import jwtToken from "../utils/jsonWebToken.js";
export const registerUser = async (req, res) => {
  try {
    const {
      fullname,
      username,
      email,
      gender,
      password,
      profilePic,
      confirmPassword,
    } = req.body;

    if (!fullname || !username || !email || !gender || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required ❌",
      });
    }

    // Check if user already exists
    const user = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (user) {
      return res.status(409).json({
        success: false,
        message: "User already exists ❌",
      });
    }

    if (password !== confirmPassword) {
      return res.status(409).json({
        success: false,
        message: "Password not match❌",
      });
    }

    // Hash password
    const hashPassword = await bcrypt.hash(password, 10);

    // Default profile pics
    const defaultBoy = `https://api.dicebear.com/7.x/adventurer/svg?seed=boy12&username=${username}`;
    const defaultGirl = `https://api.dicebear.com/7.x/adventurer/svg?seed=girl12&username=${username}`;

    // Create user
    const newUser = new User({
      fullname,
      username,
      email,
      gender,
      password: hashPassword,
      profilePic: gender === "male" ? defaultBoy : defaultGirl,
    });

    await newUser.save();
    jwtToken(newUser._id, res);

    return res.status(201).json({
      success: true,
      message: "User registered successfully ✅",
      fullname,
      username,
      gender,
      profilePic,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error ❌",
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({
        success: false,
        message: "All Fields are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const comparePass = await bcrypt.compare(password, user.password || "");
    if (!comparePass) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }

    await jwtToken(user._id, res);
    return res.status(200).json({
      success: true,
      message: "Login successfully✅",
      id: user._id,
      fullname: user.fullname,
      username: user.username,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error ❌",
    });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.cookie("jwt", "", {
      maxAge: 0,
    });
    res.status(200).json({ success: true, message: "Logout successfully✅" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error ❌",
    });
  }
};
