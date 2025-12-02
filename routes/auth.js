const express = require("express");
const {
  register,
  login,
  getMe,
  getAllUsers,
  deleteUser,
} = require("../controllers/AuthController");
const { protect } = require("../middleware/isAdmin");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.get("/getAll", getAllUsers);
router.delete("/:id", deleteUser);

module.exports = router;
