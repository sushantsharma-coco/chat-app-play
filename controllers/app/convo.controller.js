const { default: mongoose } = require("mongoose");
const Convo = require("../../models/convo.model");
const Group = require("../../models/group.model");
const { ApiError } = require("../../utils/ApiError.utils");
const { ApiResponse } = require("../../utils/ApiResponse.utils");
const { catcher } = require("../../utils/catcher.utils");

const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.length())
      throw new ApiError(400, "message was sent empty to backend");

    let convo = await Convo.findOne({
      membersRef: {
        $all: [req.user?._id, reciver_id],
      },
    });

    if (!convo)
      convo = await Convo.create({
        membersRef: [req.user?._id, reciver_id],
        "chats.senderRef": req.user?._id,
        "chats.text": [],
      });

    convo.chats.push(message);
    await convo.save();

    if (!convo) throw new ApiError(500, "unable to send message to reciver");

    return res
      .status(201)
      .send(new ApiResponse(201, convo, "message send successfully"));
  } catch (error) {
    catcher(error, res);
  }
};

const getMessages = async (req, res) => {
  try {
    const { reciver_id } = req.params;

    const messages = await Convo.find({
      membersRef: {
        $all: [req.user?._id, reciver_id],
      },
    });

    return res
      .status(200)
      .send(
        new ApiResponse(200, messages, "all messages fetched successfully")
      );
  } catch (error) {
    catcher(error, res);
  }
};

const updateMessage = async (req, res) => {
  try {
    const { reciver_id } = req.params;
    const { message_id } = req.params;
    const { message } = req.body;

    if (!message_id) throw new ApiError(400, "message_id not sent to backend");

    if (!message || message == "")
      throw new ApiError(400, "message not sent to backend");

    const updt = await Convo.aggregate([
      {
        $match: {
          membersRef: {
            $all: [req.user?._id, reciver_id],
          },
        },
      },
      {
        $unwind: {
          path: chats,
        },
      },
      {
        $match: {
          senderRef: reciver_id,
          "text._id": mongoose.Schema.ObjectId(message_id),
        },
      },
      {
        $set: {
          text: message,
        },
      },
    ]);

    if (!updt) throw new ApiError(404, "message not found to update");

    return res
      .status(200)
      .send(new ApiResponse(200, updt, "message updated successfully"));
  } catch (error) {
    catcher(error, res);
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { message_id } = req.params;
    if (!message_id) throw new ApiError(400, "message_id not sent to backend");

    const { reciver_id } = req.params;
    if (!reciver_id) throw new ApiError(400, "reciver_id not sent to backend");

    let msgs = await Convo.findOne({
      senderRef: { $all: [req.user?._id, reciver_id] },
    }).select("messages");

    msgs = msgs.filter((msg) => msg._id !== message_id);
    await msgs.save();

    return res
      .status(200)
      .send(new ApiResponse(200, msgs, "message deleted successfully"));
  } catch (error) {
    catcher(error);
  }
};

module.exports = { sendMessage, getMessages, updateMessage, deleteMessage };
