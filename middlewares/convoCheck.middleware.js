const convoCheck = async (req, res, next) => {
  try {
    if (!req.user?._id || !isValidObjectId(req.user?._id))
      throw new ApiError(401, "invalid user creds");

    const { reciver_id } = req.params;

    if (!reciver_id || reciver_id == "")
      throw new ApiError(400, "reciver _id not sent to backend");

    next();
  } catch (error) {
    console.error("error occured :", error?.message);

    return res
      .status(error?.statusCode || 500)
      .send(
        new ApiResponse(
          error?.statusCode || 500,
          error?.message || "internal server error",
          error?.errors
        )
      );
  }
};
