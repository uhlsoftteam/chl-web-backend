const express = require("express");
const {
  getNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
} = require("../controllers/NewsController");

// Import the middleware you selected
const { protect, isAdmin } = require("../middleware/isAdmin");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// Public routes
router.get("/", getNews);
router.get("/:id", getNewsById);

// Admin only routes
router.post("/", protect, isAdmin, upload.single("coverImage"), createNews);
router.put("/:id", protect, isAdmin, upload.single("coverImage"), updateNews);
router.delete("/:id", protect, isAdmin, deleteNews);

module.exports = router;
