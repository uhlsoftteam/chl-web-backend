const Doctor = require("../models/Doctor");

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
    // UPDATE: Added .populate()
    const doctor = await Doctor.findOne({
      slug: req.params.slug,
      isActive: true,
    }).populate("department");

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
    const doctor = await Doctor.create(req.body);
    res.status(201).json({ success: true, data: doctor });
  } catch (error) {
    // Check for duplicate slug error (MongoDB code 11000)
    if (error.code === 11000 && error.keyPattern.slug) {
      return res.status(400).json({
        success: false,
        error:
          "A doctor with this name/slug already exists. Please modify the slug manually.",
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
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
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
    await doctor.deleteOne();
    res.status(200).json({ success: true, message: "Doctor deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.reorderDoctors = async (req, res) => {
  try {
    const { orderedIds } = req.body;

    if (!orderedIds || !Array.isArray(orderedIds)) {
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
