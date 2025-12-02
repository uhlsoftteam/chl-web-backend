const express = require("express");
const {
  getBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
} = require("../controllers/BlogController");

const { protect, isAdmin } = require("../middleware/isAdmin");

const router = express.Router();

// Public routes
router.get("/", getBlogs);
router.get("/:slug", getBlogBySlug);

// Admin only routes
router.post("/", protect, isAdmin, createBlog);
router.put("/:id", protect, isAdmin, updateBlog);
router.delete("/:id", protect, isAdmin, deleteBlog);

module.exports = router;
