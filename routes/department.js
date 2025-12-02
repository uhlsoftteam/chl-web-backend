const express = require("express");
const {
  getDepartments,
  getDepartmentBySlug,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require("../controllers/DepartmentController");

const router = express.Router();

router.route("/").get(getDepartments).post(createDepartment);

router.route("/:id").put(updateDepartment).delete(deleteDepartment);

router.route("/slug/:slug").get(getDepartmentBySlug);

module.exports = router;
