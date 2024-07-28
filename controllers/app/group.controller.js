const { isValidObjectId, default: mongoose } = require("mongoose");
const Convo = require("../../models/convo.model");
const Group = require("../../models/group.model");
const { ApiError } = require("../../utils/ApiError.utils");
const { ApiResponse } = require("../../utils/ApiResponse.utils");
const { catcher } = require("../../utils/catcher.utils");

const createGroup = async (req, res) => {
  try {
    // first i need to create convo which'll be empty for first then i need to create group which also'll be empty and then I'll update it

    const { groupName } = req.body;
    const groupOwnerRef = req.user?._id;
    const admin = [req.user?._id];

    const groupWithNameExists = await Group.findOne({ groupName });
    if (groupWithNameExists)
      throw new ApiError(
        400,
        "group with this name already exists, try another name."
      );

    const convo = await Convo.create({
      membersRef: [groupOwnerRef],
      chats: [],
    });

    if (!convo) throw new ApiError(500, "unable to create convo for group");

    const group = await Group.create({
      groupOwnerRef,
      admin,
      subAdmin: [],
      groupName,
      convoRef: convo?._id,
    });

    if (!group)
      throw new ApiError(
        500,
        "convo created but unable to initialize the group"
      );

    return res
      .status(200)
      .send(
        new ApiResponse(
          200,
          group,
          "group created successfully, please insert members if not yet done."
        )
      );
  } catch (error) {
    catcher(error, res);
  }
};

const getGroupDetails = async (req, res) => {
  try {
    const { group_id } = req.params;

    const groupData = await Group.findById(group_id);

    if (!groupData) throw new ApiError(404, "group data not found");

    return res
      .status(200)
      .send(new ApiResponse(200, groupData, "group info fetched successfully"));
  } catch (error) {
    catcher(error, res);
  }
};

const updateGroupName = async (req, res) => {
  try {
    const { groupName } = req.body;
    const { group_id } = req.params;

    if (!isValidObjectId(group_id))
      throw new ApiError(400, "invalid group object id");

    const group = await Group.findById(group_id);

    if (!group) throw new ApiError(404, "group with group id not found");

    if (group.groupOwnerRef !== req.user?._id)
      throw new ApiError(403, "you aren't allowed to make this request");

    group.groupName = groupName;
    await group.save();

    return res
      .status(200)
      .send(new ApiResponse(200, group, "group name updated successfully"));
  } catch (error) {
    catcher(error, res);
  }
};

const deleteGroup = async (req, res) => {
  try {
    const { group_id } = req.params;

    const group = await Group.findOneAndUpdate(
      {
        _id: group_id,
        groupOwnerRef: req.user?._id,
      },
      {
        $set: {
          isDeleted: true,
        },
      },
      { new: true }
    );

    if (!group.isDeleted)
      throw new ApiError(404, "group not found to be deleted");

    return res
      .status(200)
      .send(
        new ApiResponse(
          204,
          { group: group.groupName },
          "group deleted successfully"
        )
      );
  } catch (error) {
    catcher(error, res);
  }
};

const addMembers = async (req, res) => {
  try {
    const { membersRef } = req.body;
    const { groupRef } = req.params;

    let invalidMembers = [];

    membersRef.forEach((member) => {
      if (!isValidObjectId(member)) invalidMembers.push(member);
    });

    if (invalidMembers.length)
      throw new ApiError(400, `${invalidMembers} are invalid objectid`);

    // const { convo } = await Group.aggregate([
    //   {
    //     $match: {
    //       _id: mongoose.Schema.ObjectId(groupRef),
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "Convo",
    //       localField: "convoRef",
    //       foreignField: "_id",
    //       as: "convo",
    //     },
    //   },
    // ]);

    // if (!convo) throw new ApiError(404, "group conversation not found");

    // membersRef.forEach((member) => convo.membersRef.push(member));
    // await convo.save();

    const groupExists = await Group.findById(groupRef);

    if (!groupExists) throw new ApiError(404, "group not found");

    if (
      !groupExists.admin.includes(req.user?._id) ||
      !groupExists.subAdmin.includes(req.user?._id)
    )
      throw new ApiError(
        403,
        "you can't add new member as you aren't admin or subadmin of the group"
      );

    const convo = await Convo.findById(groupExists?._id);

    membersRef.forEach((member) => {
      convo.membersRef.push(member);
    });

    await convo.save();

    groupExists.membersCount = convo.membersRef.length();
    await groupExists.save();

    return res
      .status(200)
      .send(
        new ApiResponse(
          200,
          { members: groupExists.membersCount },
          "members added successfully"
        )
      );
  } catch (error) {
    catcher(error, res);
  }
};

const makeAdminSubAdmin = async (req, res) => {
  try {
    const { admin, subAdmin } = req.body;
    const { group_id } = req.params;

    if (!admin.length || !subAdmin.length || !isValidObjectId(group_id))
      throw new ApiError(400, "invalid admin, subadmin or group _id");

    const group = await Group.findById(group_id);

    if (!group) throw new ApiError(404, "group not found");

    if (group.groupOwnerRef !== req.user?._id)
      throw new ApiError(
        404,
        "you aren't the owner or admin of this group and your request has been denied"
      );

    const members = await Convo.findById(group.convoRef).select(
      "membersRef -_id"
    );

    [...admin, ...subAdmin].forEach((a) => {
      if (!isValidObjectId(a))
        throw new ApiError(400, "invalid objectId in admin or subAdmin");

      if (!members.includes(a))
        throw new ApiError(400, `${a} isn't the member of group`);
    });

    group.admin = [...group.admin, ...admin];
    group.subAdmin = [...group.subAdmin, ...subAdmin];

    await group.save();

    return res.status(200).send(
      new ApiResponse(
        200,
        {
          groupAdminCount: group.admin.length(),
          groupSubAdminCount: group.subAdmin.length(),
        },
        "admin and subadmin added successfully"
      )
    );
  } catch (error) {
    catcher(error, res);
  }
};

const sendMessageInGroup = async (req, res) => {
  try {
  } catch (error) {
    catcher(error, res);
  }
};

const getMessagesOfGroup = async (req, res) => {
  try {
  } catch (error) {
    catcher(error, res);
  }
};
const updateMessageInGroup = async (req, res) => {
  try {
  } catch (error) {
    catcher(error, res);
  }
};
const deleteMessageInGroup = async (req, res) => {
  try {
  } catch (error) {
    catcher(error, res);
  }
};

module.exports = {
  createGroup,
  getGroupDetails,
  updateGroupName,
  deleteGroup, //patch method
  addMembers,
  makeAdminSubAdmin,
};
