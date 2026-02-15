const express = require("express");
const {
  getBoardMembers,
  createBoardMember,
  updateBoardMember,
  deleteBoardMember,
  reorderBoardMembers,
} = require("../controllers/BoardMemberController");

const { protect, isAdmin } = require("../middleware/isAdmin");
const upload = require("../middleware/uploadMiddleware");
const { compressImage } = require("../utils/compressor");

const router = express.Router();

// Public
router.get("/", getBoardMembers);

// Admin Protected
router.post(
  "/",
  protect,
  isAdmin,
  upload.single("image"),
  compressImage,
  createBoardMember
);
router.put(
  "/:id",
  protect,
  isAdmin,
  upload.single("image"),
  compressImage,
  updateBoardMember
);
router.delete("/:id", protect, isAdmin, deleteBoardMember);
router.patch("/reorder", protect, isAdmin, reorderBoardMembers);

module.exports = router;
