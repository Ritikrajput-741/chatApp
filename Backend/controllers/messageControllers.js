import { Conversation } from "../model/conversationModel.js";
import { Message } from "../model/messageModel.js";
import { getReciverSocketId, io } from "../socket/socket.js";

export const sendMessage = async (req, res) => {
  try {
    const { messages } = req.body;
    const senderId = req.user._id;
    const { id: reciverId } = req.params;

    let chats = await Conversation.findOne({
      participants: { $all: [senderId, reciverId] },
    });

    if (!chats) {
      chats = await Conversation.create({
        participants: [senderId, reciverId],
      });
    }

    const newMessage = new Message({
      senderId,
      reciverId,
      messages,
      conversationId: chats._id,
    });

    if (newMessage) {
      chats.messages.push(newMessage._id);
    }

    await Promise.all([chats.save(), newMessage.save()]); // ✅ pehle save

    // ✅ save ke baad emit
    const reciverSocketId = getReciverSocketId(reciverId);
    if (reciverSocketId) {
      io.to(reciverSocketId).emit("newMessage", newMessage);
    }

    return res.status(201).json({
      success: true,
      message: "Message sent✅",
      newMessage,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { id: reciverId } = req.params;

    let chats = await Conversation.findOne({
      participants: { $all: [senderId, reciverId] },
    }).populate("messages");

    if (!chats) return res.status(200).json([]);
    const message = chats.messages;

    return res.status(200).json({ message, success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const markSeen = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByIdAndUpdate(
      messageId,
      { seen: true },
      { returnDocument: "after" }, // ✅ deprecated fix
    );

    const senderSocketId = getReciverSocketId(message.senderId.toString());
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageSeen", { messageId });
    }

    return res.status(200).json({ success: true, message });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    // Mere liye aaye unseen messages count karo per sender
    const unreadMessages = await Message.aggregate([
      {
        $match: {
          reciverId: userId,
          seen: false,
        },
      },
      {
        $group: {
          _id: "$senderId", // sender ke hisaab se group karo
          count: { $sum: 1 },
        },
      },
    ]);

    // { senderId: count } format mein bhejo
    const unreadCount = {};
    unreadMessages.forEach((item) => {
      unreadCount[item._id.toString()] = item.count;
    });

    return res.status(200).json({ success: true, unreadCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};