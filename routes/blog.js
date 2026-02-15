const express = require("express");
const {
  getBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogById,
} = require("../controllers/BlogController");

const { protect, isAdmin } = require("../middleware/isAdmin");
const upload = require("../middleware/uploadMiddleware");
const { compressImage } = require("../utils/compressor");

const router = express.Router();

// Public routes
router.get("/", getBlogs);
router.get("/:slug", getBlogBySlug);
router.get("/id/:id", getBlogById);

// Admin only routes
router.post(
  "/",
  protect,
  isAdmin,
  upload.single("coverImage"),
  compressImage,
  createBlog
);
router.put(
  "/:id",
  protect,
  isAdmin,
  upload.single("coverImage"),
  compressImage,
  updateBlog
);
router.delete("/:id", protect, isAdmin, deleteBlog);

module.exports = router;
