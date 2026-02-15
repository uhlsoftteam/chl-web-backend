const express = require("express");
const {
  getNews,
  getNewsBySlugOrId, // Use the flexible one
  createNews,
  updateNews,
  deleteNews,
} = require("../controllers/NewsController");

const { protect, isAdmin } = require("../middleware/isAdmin");
const upload = require("../middleware/uploadMiddleware");
const { compressImage } = require("../utils/compressor");

const router = express.Router();

// Public routes
router.get("/", getNews);
// This now handles both IDs (for admin/internal) and Slugs (for SEO)
router.get("/:id", getNewsBySlugOrId);

// Admin only routes
// Middleware: verify user -> check admin status -> process file upload
router.post(
  "/",
  protect,
  isAdmin,
  upload.single("coverImage"),
  compressImage,
  createNews
);
router.put(
  "/:id",
  protect,
  isAdmin,
  upload.single("coverImage"),
  compressImage,
  updateNews
);
router.delete("/:id", protect, isAdmin, deleteNews);

module.exports = router;
