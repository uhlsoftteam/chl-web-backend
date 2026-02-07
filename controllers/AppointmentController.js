// @desc    Create new appointment

const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const sendEmail = require("../utils/sendEmail");

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

    const doctorExists = await Doctor.findById(doctorId);
    if (!doctorExists) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    const appointment = await Appointment.create({
      doctor: doctorId,
      patientName,
      phoneNumber,
      appointmentDate,
      appointmentTime,
      notes,
    });

    // --- EMAIL LOGIC START ---
    const supportEmailTemplate = `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; border: 1px solid #e0e0e0; border-top: 5px solid #0d9488; padding: 25px; color: #333;">
    <h2 style="color: #0d9488; margin-top: 0;">New Appointment Lead</h2>
    <p style="font-size: 16px;">A new appointment request has been submitted. <strong>Please contact the patient to confirm a suitable time.</strong></p>
    
    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; font-size: 14px; text-transform: uppercase; color: #666; letter-spacing: 1px;">Patient Information</h3>
      <p style="margin: 5px 0;"><strong>Name:</strong> ${patientName}</p>
      <p style="margin: 5px 0; font-size: 18px; color: #0d9488;"><strong>Phone:</strong> <a href="tel:${phoneNumber}" style="color: #0d9488; text-decoration: none;">${phoneNumber}</a></p>
    </div>

    <div style="padding: 0 15px;">
      <h3 style="font-size: 14px; text-transform: uppercase; color: #666; letter-spacing: 1px;">Request Details</h3>
      <p style="margin: 5px 0;"><strong>Preferred Doctor:</strong> ${
        doctorExists.name
      }</p>
      <p style="margin: 5px 0;"><strong>Requested Date:</strong> ${new Date(
        appointmentDate
      ).toDateString()}</p>
      <p style="margin: 5px 0;"><strong>Preferred Shift:</strong> ${appointmentTime}</p>
      ${
        notes
          ? `<p style="margin: 5px 0;"><strong>Patient Notes:</strong> ${notes}</p>`
          : ""
      }
    </div>

    <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />
    
    <div style="text-align: center;">
      <p style="font-size: 13px; color: #888;">Continental Hospital Internal Notification System</p>
    </div>
  </div>
`;

    try {
      await sendEmail({
        email: process.env.HOSPITAL_ADMIN_EMAIL, // This should be your support center address
        subject: `ACTION REQUIRED: Appointment Request - ${patientName}`,
        html: supportEmailTemplate,
      });
    } catch (err) {
      console.error("Email could not be sent", err);
      // Optional: You could log this to a separate "Failed Emails" collection in MongoDB
    }
    // --- EMAIL LOGIC END ---

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
