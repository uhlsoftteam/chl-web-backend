const Doctor = require("../models/Doctor");
const { default: mongoose } = require("mongoose");
const { uploadFileIntoS3 } = require("../services/upload-file/uploadUtility");

// Helper to get extension
const getExtension = (filename) => filename.split(".").pop().toLowerCase();

// @desc    Get all doctors
// @route   GET /api/doctors
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

// @desc    Get doctor by ID
// @route   GET /api/doctors/id/:id
exports.getDoctorById = async (req, res) => {
  try {
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

// @desc    Get doctor by slug (with ID fallback)
// @route   GET /api/doctors/:slug
exports.getDoctorBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    // Strict lookup by slug only
    const doctor = await Doctor.findOne({
      slug: slug,
      isActive: true,
    }).populate("department");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found with that slug",
      });
    }

    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create new doctor
// @route   POST /api/doctors
exports.createDoctor = async (req, res) => {
  try {
    const data = { ...req.body };

    // Parse stringified arrays from FormData
    ["schedules", "degrees", "experience", "seo"].forEach((field) => {
      if (data[field] && typeof data[field] === "string") {
        data[field] = JSON.parse(data[field]);
      }
    });

    // Handle S3 Upload
    if (req.file) {
      const extension = getExtension(req.file.originalname);
      // Passing the buffer directly to your S3 utility
      data.image = await uploadFileIntoS3(req.file.buffer, extension);
    }

    const doctor = await Doctor.create(data);
    res.status(201).json({ success: true, data: doctor });
  } catch (error) {
    if (error.code === 11000) {
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
exports.updateDoctor = async (req, res) => {
  try {
    let data = { ...req.body };

    // Parse stringified arrays
    ["schedules", "degrees", "experience", "seo"].forEach((field) => {
      if (data[field] && typeof data[field] === "string") {
        data[field] = JSON.parse(data[field]);
      }
    });

    // Handle New Image Upload to S3
    if (req.file) {
      const extension = getExtension(req.file.originalname);
      data.image = await uploadFileIntoS3(req.file.buffer, extension);

      // Note: We no longer call deleteLocalFile.
      // If you want to delete from S3, you'd implement a deleteS3Object(oldUrl) helper.
    }

    const doctor = await Doctor.findByIdAndUpdate(req.params.id, data, {
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
exports.deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    // In S3 architecture, we usually leave the image or use a Lifecycle policy,
    // but if you have a deleteS3Object function, call it here using doctor.image.

    await doctor.deleteOne();
    res.status(200).json({ success: true, message: "Doctor deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Reorder Doctors (Bulk Ranking)
exports.reorderDoctors = async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!orderedIds || !Array.isArray(orderedIds)) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of ordered IDs",
      });
    }

    const bulkOps = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { ranking: index + 1 } },
      },
    }));

    await Doctor.bulkWrite(bulkOps);
    res
      .status(200)
      .json({ success: true, message: "Doctors reordered successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Seed Doctors
exports.seedDoctors = async (req, res) => {
  try {
    const data = req.body;
    if (!Array.isArray(data) || data.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Provide an array of doctors" });
    }

    const doctors = await Doctor.insertMany(data, { ordered: false });
    res
      .status(201)
      .json({ success: true, count: doctors.length, data: doctors });
  } catch (error) {
    if (error.code === 11000 || error.writeErrors) {
      return res.status(207).json({
        success: true,
        message: "Process completed with some duplicates skipped.",
        inserted: error.insertedDocs ? error.insertedDocs.length : "Unknown",
      });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Global Search Doctors
exports.searchDoctors = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query)
      return res
        .status(400)
        .json({ success: false, message: "Query is required" });

    const Department = mongoose.model("Department");
    const matchingDepts = await Department.find({
      name: { $regex: query, $options: "i" },
    }).select("_id");

    const doctors = await Doctor.find({
      isActive: true,
      $or: [
        { name: { $regex: query, $options: "i" } },
        { designation: { $regex: query, $options: "i" } },
        { degrees: { $regex: query, $options: "i" } },
        { department: { $in: matchingDepts.map((d) => d._id) } },
      ],
    })
      .populate("department")
      .sort({ priority: 1, ranking: 1 });

    res
      .status(200)
      .json({ success: true, count: doctors.length, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Bulk Update
exports.bulkUpdateDoctors = async (req, res) => {
  try {
    const updates = req.body;
    if (!Array.isArray(updates))
      return res
        .status(400)
        .json({ success: false, message: "Array required" });

    const bulkOps = updates.map((doc) => ({
      updateOne: {
        filter: { _id: doc._id },
        update: { $set: doc },
      },
    }));

    const result = await Doctor.bulkWrite(bulkOps);
    res
      .status(200)
      .json({ success: true, message: `${result.modifiedCount} updated` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
