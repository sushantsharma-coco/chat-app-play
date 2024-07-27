const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  groupOwnerRef: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
    required: true,
    trim: true,
  },
  admin: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
      trim: true,
    },
  ],
  subAdmin: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
      trim: true,
    },
  ],
  groupName: {
    type: String,
    required: true,
  },
  membersCount: {
    type: Number,
    default: 1,
  },
  convoRef: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Convo",
    required: true,
    trim: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Group", groupSchema);
