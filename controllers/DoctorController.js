const Doctor = require("../models/Doctor");
const fs = require("fs");
const { default: mongoose } = require("mongoose");
const path = require("path");

const getImagePath = (req) => {
  return req.file ? `/uploads/doctors/${req.file.filename}` : null;
};

// Helper to delete file from filesystem
const deleteLocalFile = (filePath) => {
  // 1. Construct the full path on your hard drive
  // Assuming your structure is: root/public/uploads/...
  // and this controller is in: root/backend/controllers/
  const fullPath = path.join(__dirname, "../../public", filePath);

  // 2. Check if file exists and delete it
  if (fs.existsSync(fullPath)) {
    fs.unlink(fullPath, (err) => {
      if (err) console.error("Error deleting file:", err);
    });
  }
};

exports.getDoctors = async (req, res) => {
  try {
    const { department } = req.query;
    let query = { isActive: true };

    if (department) {
      query.department = department;
    }

    const doctors = await Doctor.find(query)
      .populate({
        path: "department",
        select: "name slug image",
      })
      // UPDATED SORTING LOGIC:
      // 1. First, sort by Priority (1, 2, 3...)
      // 2. Then, sort by Ranking (1, 2, 3...) for doctors with the SAME priority
      .sort({ priority: 1, ranking: 1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getDoctorById = async (req, res) => {
  try {
    // UPDATE: Added .populate()
    const doctor = await Doctor.findById(req.params.id).populate("department");

    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }
    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getDoctorBySlug = async (req, res) => {
  try {
    const param = req.params.slug;

    // 1. Extract the last 24 characters (MongoDB ObjectIds are 24 hex chars)
    // Input: "tunaggina-afrin-khan19-693663696bb6027feee1c318"
    // Extracted: "693663696bb6027feee1c318"
    const possibleId = param.slice(-24);

    let doctor = null;

    // 2. If it looks like a valid ID, search by ID first (Most reliable)
    if (mongoose.isValidObjectId(possibleId)) {
      doctor = await Doctor.findById(possibleId).populate("department");
    }

    // 3. Fallback: If not found by ID (or it was a legacy URL), search by exact slug
    if (!doctor) {
      doctor = await Doctor.findOne({
        slug: param,
        isActive: true,
      }).populate("department");
    }

    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create new doctor
// @route   POST /api/doctors
// @access  Private (Admin)
exports.createDoctor = async (req, res) => {
  try {
    // --- FIX START: Parse stringified arrays/objects from FormData ---
    // Multipart form-data sends everything as strings. We must parse them back to JSON.

    if (req.body.schedules && typeof req.body.schedules === "string") {
      req.body.schedules = JSON.parse(req.body.schedules);
    }

    if (req.body.degrees && typeof req.body.degrees === "string") {
      req.body.degrees = JSON.parse(req.body.degrees);
    }

    if (req.body.experience && typeof req.body.experience === "string") {
      req.body.experience = JSON.parse(req.body.experience);
    }

    if (req.body.seo && typeof req.body.seo === "string") {
      req.body.seo = JSON.parse(req.body.seo);
    }
    // --- FIX END ---

    // IF a file was uploaded, set the image field in req.body
    if (req.file) {
      req.body.image = getImagePath(req);
    }

    const doctor = await Doctor.create(req.body);
    res.status(201).json({ success: true, data: doctor });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern.slug) {
      return res.status(400).json({
        success: false,
        error: "A doctor with this name/slug already exists.",
      });
    }
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update doctor
// @route   PUT /api/doctors/:id
// @access  Private (Admin)
exports.updateDoctor = async (req, res) => {
  try {
    let newData = { ...req.body };

    // --- FIX START: Parse stringified arrays/objects ---
    if (newData.schedules && typeof newData.schedules === "string") {
      newData.schedules = JSON.parse(newData.schedules);
    }
    if (newData.degrees && typeof newData.degrees === "string") {
      newData.degrees = JSON.parse(newData.degrees);
    }
    if (newData.experience && typeof newData.experience === "string") {
      newData.experience = JSON.parse(newData.experience);
    }
    if (newData.seo && typeof newData.seo === "string") {
      newData.seo = JSON.parse(newData.seo);
    }
    // --- FIX END ---

    // 1. If a NEW image is uploaded
    if (req.file) {
      newData.image = `/uploads/doctors/${req.file.filename}`;

      const oldDoctor = await Doctor.findById(req.params.id);
      if (
        oldDoctor &&
        oldDoctor.image &&
        !oldDoctor.image.includes("default-doctor.jpg")
      ) {
        deleteLocalFile(oldDoctor.image);
      }
    }

    const doctor = await Doctor.findByIdAndUpdate(req.params.id, newData, {
      new: true,
      runValidators: true,
    });

    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }
    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete doctor
// @route   DELETE /api/doctors/:id
// @access  Private (Admin)
exports.deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    // 1. Delete the image file associated with this doctor
    if (doctor.image && !doctor.image.includes("default-doctor.jpg")) {
      deleteLocalFile(doctor.image);
    }

    // 2. Delete the database record
    await doctor.deleteOne();

    res.status(200).json({ success: true, message: "Doctor deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.reorderDoctors = async (req, res) => {
  try {
    const { orderedIds } = req.body;

    if (!orderedIds || !Array.isArray()) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of ordered IDs",
      });
    }

    // Prepare bulk write operations
    // We map through the IDs. The index in the array becomes the new 'ranking'.
    // We add 1 to index so ranking starts at 1, not 0.
    const bulkOps = orderedIds.map((id, index) => {
      return {
        updateOne: {
          filter: { _id: id },
          update: { $set: { ranking: index + 1 } },
        },
      };
    });

    // Execute all updates in a single database command
    await Doctor.bulkWrite(bulkOps);

    res.status(200).json({
      success: true,
      message: "Doctors reordered successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.seedDoctors = async (req, res) => {
  try {
    // 1. You can either read from the JSON file created in step 2:
    // const data = JSON.parse(
    //   fs.readFileSync(path.join(__dirname, '../data/departments.json'), 'utf-8')
    // );

    // 2. OR you can just accept the array via the Request Body (Postman):
    const data = req.body;

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of doctors",
      });
    }

    // Option: Clear existing departments to avoid duplicate key errors?
    // await Department.deleteMany({});

    // Use insertMany for bulk creation
    // ordered: false ensures that if one fails (e.g. duplicate), the others still insert
    const docotrs = await Doctor.insertMany(data, { ordered: false });

    res.status(201).json({
      success: true,
      count: docotrs.length,
      data: docotrs,
    });
  } catch (error) {
    // Check if error is due to duplicates (code 11000)
    if (error.code === 11000 || error.writeErrors) {
      // If using insertMany with ordered:false, Mongoose throws an error containing the inserted docs and the errors
      return res.status(207).json({
        success: true,
        message: "Process completed with some duplicate errors skipped.",
        inserted: error.insertedDocs ? error.insertedDocs.length : "Unknown",
      });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};
