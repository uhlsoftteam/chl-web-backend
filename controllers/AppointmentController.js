// @desc    Create new appointment

const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");

// @route   POST /api/appointments
exports.createAppointment = async (req, res) => {
  try {
    const {
      doctorId,
      patientName,
      phoneNumber,
      appointmentDate,
      appointmentTime,
      notes,
    } = req.body;

    // 1. Check if the doctor exists
    const doctorExists = await Doctor.findById(doctorId);
    if (!doctorExists) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    // 2. Create the appointment
    const appointment = await Appointment.create({
      doctor: doctorId,
      patientName,
      phoneNumber,
      appointmentDate,
      appointmentTime,
      notes,
    });

    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all appointments (optional filter by doctor)
// @route   GET /api/appointments
exports.getAppointments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.doctorId) filter.doctor = req.query.doctorId;

    const appointments = await Appointment.find(filter)
      .populate("doctor", "name designation department") // Populates doctor details
      .sort("-appointmentDate");

    res
      .status(200)
      .json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
