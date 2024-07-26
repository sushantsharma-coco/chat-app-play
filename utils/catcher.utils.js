const catcher = async (error, res) => {
  if (error) {
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

module.exports = { catcher };
