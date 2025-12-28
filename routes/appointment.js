const express = require("express");
const {
  createAppointment,
  getAppointments,
} = require("../controllers/AppointmentController");
const router = express.Router();
router.route("/").post(createAppointment).get(getAppointments);

module.exports = router;
