const express = require("express");
const router = express.Router();
const {
  getFAQs,
  getAllFAQsAdmin,
  createFAQ,
  updateFAQ,
  deleteFAQ,
} = require("../controllers/FAQController");

const { protect, isAdmin } = require("../middleware/isAdmin");

// Middleware to protect routes (Assuming you have an auth middleware)
// const { protect, admin } = require('../middleware/auth');

// Public route to view active FAQs
router.get("/", getFAQs);

// Admin routes (Commented out auth middleware for now, uncomment when ready)
// router.get('/admin', protect, admin, getAllFAQsAdmin);
// router.post('/', protect, admin, createFAQ);
// router.put('/:id', protect, admin, updateFAQ);
// router.delete('/:id', protect, admin, deleteFAQ);

// Unprotected versions for testing purposes:
router.get("/all", getAllFAQsAdmin);
router.post("/", protect, isAdmin, createFAQ);
router.put("/:id", protect, isAdmin, updateFAQ);
router.delete("/:id", protect, isAdmin, deleteFAQ);

module.exports = router;
