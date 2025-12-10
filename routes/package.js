const express = require("express");
const {
  getPackages,
  getPackageBySlug,
  createPackage,
  updatePackage,
  seedPackages,
} = require("../controllers/PackageController"); // Path to your controller

const router = express.Router();

// Public routes for fetching data
router.route("/").get(getPackages); // GET /api/v1/packages

router.route("/:slug").get(getPackageBySlug); // GET /api/v1/packages/executive-basic-women

// Admin/Protected routes for creating/updating
// You would typically add an authentication/authorization middleware here (e.g., protect, authorize)
router.route("/").post(createPackage); // POST /api/v1/packages

router.route("/:id").put(updatePackage); // PUT /api/v1/packages/:id

router.route("/seed").post(seedPackages);

module.exports = router;
