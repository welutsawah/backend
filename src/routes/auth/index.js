const express = require("express");
const { Register, Login, GetUser } = require("../../controllers/auth");
const UserAuth = require("../../midlewares/auth");

const router = express.Router();

router.post("/register", Register);
router.post("/login", Login);
router.get("/detail", UserAuth, GetUser);

module.exports = router;
