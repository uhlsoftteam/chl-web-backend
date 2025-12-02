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

const router = express.Router();

// Public routes
router.get("/", getNews);
router.get("/:id", getNewsById);

// Admin only routes
router.post("/", protect, isAdmin, createNews);
router.put("/:id", protect, isAdmin, updateNews);
router.delete("/:id", protect, isAdmin, deleteNews);

module.exports = router;
