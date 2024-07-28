const {
  sendMessage,
  getMessages,
  updateMessage,
  deleteMessage,
} = require("../../controllers/app/convo.controller");
const { auth } = require("../../middlewares/auth.middleware");
const { convoCheck } = require("../../middlewares/convoCheck.middleware");

const router = require("express").Router();

router.use(auth);

router
  .route("/:reciver_id")
  .post(convoCheck, sendMessage)
  .get(convoCheck, getMessages);

router
  .route("/:reciver_id/:message_id")
  .patch(convoCheck, updateMessage)
  .delete(convoCheck, deleteMessage);

module.exports = { router };
