import { Conversation } from "../model/conversationModel.js";
import { User } from "../model/userModel.js";

export const serachUser = async (req, res) => {
  try {
    const search = req.query.search?.trim();

    if (!search) {
      return res.status(400).json({
        success: false,
        message: "Search query required",
      });
    }

    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [
        { username: { $regex: search, $options: "i" } },
        { fullname: { $regex: search, $options: "i" } },
      ],
    }).select("username fullname profilePic email");

    res.status(200).json({
      success: true,
      users,
      message: "Found your search",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCurrentChatter = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const currentChatter = await Conversation.find({
      participants: currentUserId,
    }).sort({
      updatedAt: -1,
    });

    if (!currentChatter || currentChatter.length === 0) {
      return res.status(400).send([]);
    }

    const participantsIDS = currentChatter.reduce((ids, conversation) => {
      const otherParticipants = conversation.participants.filter(
        (id) => id !== currentUserId,
      );

      return [...ids, ...otherParticipants];
    }, []);

    const otherParticipantsIDS = participantsIDS.filter(
      (id) => id.toString() !== currentUserId.toString(),
    );

    const user = await User.find({ _id: { $in: otherParticipantsIDS } })
      .select("-password")
      .select("-email");

    const users = otherParticipantsIDS.map((id) =>
      user.find((id) =>
        user.find((user) => user._id.toString() === id.toString()),
      ),
    );

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
