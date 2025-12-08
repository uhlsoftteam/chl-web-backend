const express = require("express");
const {
  getDepartments,
  getDepartmentBySlug,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  seedDepartments,
} = require("../controllers/DepartmentController");

const router = express.Router();

router.route("/").get(getDepartments).post(createDepartment);

router.route("/:id").put(updateDepartment).delete(deleteDepartment);

router.route("/slug/:slug").get(getDepartmentBySlug);

router.route("/seed").post(seedDepartments);

module.exports = router;
