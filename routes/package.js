const express = require("express");
const upload = require("../middleware/uploadMiddleware"); // Import your middleware
const {
  getPackages,
  getPackageBySlug,
  createPackage,
  updatePackage,
  seedPackages,
  searchPackages,
} = require("../controllers/PackageController");
const { compressImage } = require("../utils/compressor");

const router = express.Router();

// Public routes
router.route("/").get(getPackages);
router.get("/search", searchPackages);
router.route("/:slug").get(getPackageBySlug);

// Protected routes with Image Upload
// "packageImage" must match the key used in your Postman/Frontend FormData
router
  .route("/")
  .post(upload.single("packageImage"), compressImage, createPackage);
router
  .route("/:id")
  .put(upload.single("packageImage"), compressImage, updatePackage);

router.route("/seed").post(seedPackages);

module.exports = router;
