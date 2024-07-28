const { login, logout } = require("../../controllers/auth/auth.controller");

const router = require("express").Router();

router.route("/sign-in").post(login);
router.route("/sign-out").get(logout);

module.exports = { router };
