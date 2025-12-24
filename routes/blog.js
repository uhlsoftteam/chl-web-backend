const express = require("express");
const {
  getBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
} = require("../controllers/BlogController");

const { protect, isAdmin } = require("../middleware/isAdmin");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// Public routes
router.get("/", getBlogs);
router.get("/:slug", getBlogBySlug);

// Admin only routes
router.post("/", protect, isAdmin, upload.single("coverImage"), createBlog);
router.put("/:id", protect, isAdmin, upload.single("coverImage"), updateBlog);
router.delete("/:id", protect, isAdmin, deleteBlog);

module.exports = router;
