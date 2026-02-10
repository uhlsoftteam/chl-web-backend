const express = require("express");
const {
  getClinicsAndCenters,
  getCenterBySlug,
  createCenter,
  updateCenter,
  deleteCenter,
  seedClinicsAndCenters,
} = require("../controllers/ClinicAndCenterController");

const { protect, isAdmin } = require("../middleware/isAdmin");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router
  .route("/")
  .get(getClinicsAndCenters)
  .post(protect, isAdmin, upload.single("image"), createCenter);

router
  .route("/:id")
  .put(protect, isAdmin, upload.single("image"), updateCenter)
  .delete(protect, isAdmin, deleteCenter);

router.route("/slug/:slug").get(getCenterBySlug);

router.post("/seed", seedClinicsAndCenters);

module.exports = router;
