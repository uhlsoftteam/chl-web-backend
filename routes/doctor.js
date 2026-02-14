const express = require("express");
const {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorBySlug,
  reorderDoctors,
  seedDoctors,
  searchDoctors,
  bulkUpdateDoctors,
} = require("../controllers/DoctorController");

const { protect, isAdmin } = require("../middleware/isAdmin");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// --- Public Routes ---
router.get("/", getDoctors);
router.get("/search", searchDoctors); // Must be above /:slug
router.get("/:slug", getDoctorBySlug);
router.get("/id/:id", getDoctorById); // Added a specific path for ID if needed

// --- Admin Protected Routes ---
// Use .all or apply middleware to a group if you prefer,
// but sticking to your current style:

router.post("/", protect, isAdmin, upload.single("image"), createDoctor);

router.put("/:id", protect, isAdmin, upload.single("image"), updateDoctor);

router.delete("/:id", protect, isAdmin, deleteDoctor);
router.patch("/reorder", protect, isAdmin, reorderDoctors);

// Seed and Bulk updates
router.post("/seed", protect, isAdmin, seedDoctors);
router.post("/bulk-update", protect, isAdmin, bulkUpdateDoctors);

module.exports = router;
