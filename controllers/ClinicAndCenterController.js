const ClinicAndCenter = require("../models/ClinicAndCenter");
const fs = require("fs");
const path = require("path");

// Helper to get image path
const getImagePath = (req) => {
  return req.file ? `/uploads/centers/${req.file.filename}` : null;
};

// Helper to delete file from filesystem
const deleteLocalFile = (filePath) => {
  const fullPath = path.join(__dirname, "../../public", filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlink(fullPath, (err) => {
      if (err) console.error("Error deleting file:", err);
    });
  }
};

// @desc    Get all clinics/centers
// @route   GET /api/clinics-and-centers
exports.getClinicsAndCenters = async (req, res) => {
  try {
    // Change 'department' to 'departments'
    const centers = await ClinicAndCenter.find({ isActive: true }).populate(
      "departments",
      "name slug"
    );
    res
      .status(200)
      .json({ success: true, count: centers.length, data: centers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single center by Slug
// @route   GET /api/clinics-and-centers/slug/:slug
exports.getCenterBySlug = async (req, res) => {
  try {
    const center = await ClinicAndCenter.findOne({
      slug: req.params.slug,
    }).populate("departments", "name slug"); // CHANGED from department to departments

    if (!center) {
      return res
        .status(404)
        .json({ success: false, message: "Center not found" });
    }
    res.status(200).json({ success: true, data: center });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create center
// @route   POST /api/clinics-and-centers
exports.createCenter = async (req, res) => {
  try {
    // Parse keywords or SEO if they come as stringified JSON from FormData
    if (req.body.keywords && typeof req.body.keywords === "string") {
      req.body.keywords = JSON.parse(req.body.keywords);
    }

    if (req.file) {
      req.body.image = getImagePath(req);
    }

    const center = await ClinicAndCenter.create(req.body);
    res.status(201).json({ success: true, data: center });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update center
// @route   PUT /api/clinics-and-centers/:id
exports.updateCenter = async (req, res) => {
  try {
    let newData = { ...req.body };

    if (newData.keywords && typeof newData.keywords === "string") {
      newData.keywords = JSON.parse(newData.keywords);
    }

    if (req.file) {
      newData.image = `/uploads/centers/${req.file.filename}`;

      // Delete old image
      const oldCenter = await ClinicAndCenter.findById(req.params.id);
      if (oldCenter?.image && !oldCenter.image.includes("default-center.jpg")) {
        deleteLocalFile(oldCenter.image);
      }
    }

    const center = await ClinicAndCenter.findByIdAndUpdate(
      req.params.id,
      newData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!center) {
      return res
        .status(404)
        .json({ success: false, message: "Center not found" });
    }
    res.status(200).json({ success: true, data: center });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete center
// @route   DELETE /api/clinics-and-centers/:id
exports.deleteCenter = async (req, res) => {
  try {
    const center = await ClinicAndCenter.findById(req.params.id);
    if (!center) {
      return res
        .status(404)
        .json({ success: false, message: "Center not found" });
    }

    if (center.image && !center.image.includes("default-center.jpg")) {
      deleteLocalFile(center.image);
    }

    await center.deleteOne();
    res.status(200).json({ success: true, message: "Center deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.seedClinicsAndCenters = async (req, res) => {
  try {
    const data = req.body;

    if (!Array.isArray(data) || data.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Provide an array" });
    }

    // Manually generate slugs because insertMany skips pre-save hooks
    const preparedData = data.map((item) => ({
      ...item,
      slug: item.title
        .toLowerCase()
        .replace(/[^\w ]+/g, "")
        .replace(/ +/g, "-")
        .trim(),
    }));

    await ClinicAndCenter.deleteMany({});

    const centers = await ClinicAndCenter.insertMany(preparedData, {
      ordered: false,
    });

    res.status(201).json({
      success: true,
      count: centers.length,
      data: centers,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
