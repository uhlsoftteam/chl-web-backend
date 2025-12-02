const express = require("express");
const {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorBySlug,
  reorderDoctors,
} = require("../controllers/DoctorController");

const { protect, isAdmin } = require("../middleware/isAdmin");

const router = express.Router();

// Public routes
router.get("/", getDoctors);
router.get("/:slug", getDoctorBySlug);

// Admin routes
router.post("/", createDoctor);
router.put("/:id", protect, isAdmin, updateDoctor);
router.delete("/:id", protect, isAdmin, deleteDoctor);

router.patch("/reorder", protect, isAdmin, reorderDoctors);

module.exports = router;
