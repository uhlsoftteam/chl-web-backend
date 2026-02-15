const express = require("express");
const {
  getDepartments,
  getDepartmentBySlug,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  seedDepartments,
} = require("../controllers/DepartmentController");
const { protect, isAdmin } = require("../middleware/isAdmin");
const upload = require("../middleware/uploadMiddleware");
const { compressImage } = require("../utils/compressor");

const router = express.Router();

router
  .route("/")
  .get(getDepartments)
  .post(
    protect,
    isAdmin,
    upload.single("image"),
    compressImage,
    createDepartment
  );

router
  .route("/:id")
  .put(
    protect,
    isAdmin,
    upload.single("image"),
    compressImage,
    updateDepartment
  )
  .delete(deleteDepartment);

router.route("/slug/:slug").get(getDepartmentBySlug);

router.route("/seed").post(seedDepartments);

module.exports = router;
