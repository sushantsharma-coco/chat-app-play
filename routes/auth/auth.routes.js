const { login, logout } = require("../../controllers/auth/auth.controller");
const { auth } = require("../../middlewares/auth.middleware");

const router = require("express").Router();

router.route("/sign-in").post(login);

router.use(auth);
router.route("/sign-out").get(logout);

module.exports = { router };
