const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "An appointment must belong to a doctor"],
    },
    patientName: {
      type: String,
      required: [true, "Please provide the patient name"],
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "Please provide a contact number"],
    },
    appointmentDate: {
      type: String, // Change this from Date to String
      required: [true, "Please provide the appointment date"],
    },
    appointmentTime: {
      type: String, // e.g., "10:30 AM"
      required: [true, "Please provide the appointment time"],
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
      default: "Pending",
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
