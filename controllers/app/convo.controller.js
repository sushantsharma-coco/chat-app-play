const { default: mongoose } = require("mongoose");
const Convo = require("../../models/convo.model");
const { ApiError } = require("../../utils/ApiError.utils");
const { ApiResponse } = require("../../utils/ApiResponse.utils");
const { catcher } = require("../../utils/catcher.utils");
const { io, getOnlineSocketIds } = require("../../sockets/socket");

const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { reciver_id } = req.params;

    if (!message || !message.length)
      throw new ApiError(400, "message was sent empty to backend");

    let obj = { senderRef: req.user?._id, text: message };

    let convo = await Convo.findOneAndUpdate(
      {
        membersRef: {
          $all: [req.user?._id, reciver_id],
        },
      },
      {
        $push: {
          chats: obj,
        },
      },
      { new: true }
    );

    if (!convo) {
      convo = await Convo.create({
        membersRef: [req.user?._id, reciver_id],
        chats: [obj],
      });
    }

    if (!convo) throw new ApiError(500, "unable to send message to reciver");

    const ids = getOnlineSocketIds(reciver_id);
    const myIds = getOnlineSocketIds(req.user?._id);

    io.to(ids).emit("newMessage", convo.chats[convo.chats.length - 1]);
    io.to(myIds).emit("sentMessage", convo.chats[convo.chats.length - 1]);

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

    const convo = await Convo.find({
      membersRef: {
        $all: [req.user?._id, reciver_id],
      },
    });

    return res
      .status(200)
      .send(new ApiResponse(200, convo, "all messages fetched successfully"));
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

    const updt = await Convo.findOneAndUpdate(
      {
        membersRef: { $all: [reciver_id, req.user?._id] },
        "chats._id": new mongoose.Types.ObjectId(message_id),
      },
      {
        $set: {
          text: message,
        },
      },
      { new: true }
    );

    if (!updt) throw new ApiError(404, "message not found to update");

    const ids = getOnlineSocketIds(reciver_id);
    const myIds = getOnlineSocketIds(req.user?._id);

    io.to(ids).emit("updatedMessage", updt);
    io.to(myIds).emit("myUpdatedMessage", updt);

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

    let msg = await Convo.findOneAndDelete({
      senderRef: { $all: [req.user?._id, reciver_id] },
      "chats._id": new mongoose.Types.ObjectId(message_id),
    });

    const ids = getOnlineSocketIds(reciver_id);
    const myIds = getOnlineSocketIds(req.user?._id);

    io.to(ids).emit("deletedMessage", `${msg} deleted`);
    io.to(myIds).emit("myDeletedMessage", `${msg} deleted`);

    return res
      .status(200)
      .send(new ApiResponse(200, msg, "message deleted successfully"));
  } catch (error) {
    return res.status(500).send(new ApiError(500, error?.message));
  }
};

module.exports = { sendMessage, getMessages, updateMessage, deleteMessage };
