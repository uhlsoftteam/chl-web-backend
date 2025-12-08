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
} = require("../controllers/DoctorController");

const { protect, isAdmin } = require("../middleware/isAdmin");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", getDoctors);
router.get("/:slug", getDoctorBySlug);

// Admin routes
// 1. Add upload.single('image') to POST
router.post(
  "/",
  // protect,
  // isAdmin,
  upload.single("image"), // 'image' matches the form-data key
  createDoctor
);

// 2. Add upload.single('image') to PUT
router.put("/:id", upload.single("image"), updateDoctor);

router.delete("/:id", protect, isAdmin, deleteDoctor);
router.patch("/reorder", protect, isAdmin, reorderDoctors);
router.route("/seed").post(seedDoctors);

module.exports = router;
