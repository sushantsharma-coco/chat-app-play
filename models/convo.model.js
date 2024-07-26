const mongoose = require("mongoose");

const convoSchema = new mongoose.Schema(
  {
    membersRef: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
        required: true,
        trim: true,
      },
    ],
    chats: [
      {
        senderRef: {
          type: mongoose.SchemaTypes.ObjectId,
          ref: "User",
          required: true,
          trim: true,
        },
        text: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Convo", convoSchema);
