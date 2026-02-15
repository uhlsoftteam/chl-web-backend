const ClinicAndCenter = require("../models/ClinicAndCenter");
const { uploadFileIntoS3 } = require("../services/upload-file/uploadUtility");

// Helper to get extension
const getExtension = (filename) => filename.split(".").pop().toLowerCase();

// @desc    Get all clinics/centers
// @route   GET /api/clinics-and-centers
exports.getClinicsAndCenters = async (req, res) => {
  try {
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
    }).populate("departments");

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
exports.createCenter = async (req, res) => {
  try {
    const data = { ...req.body };

    // 1. Handle JSON parsing for keywords AND departments
    if (data.keywords && typeof data.keywords === "string") {
      data.keywords = JSON.parse(data.keywords);
    }

    // ADD THIS BLOCK
    if (data.departments && typeof data.departments === "string") {
      data.departments = JSON.parse(data.departments);
    }

    // 2. Handle S3 Upload
    if (req.file) {
      const extension = getExtension(req.file.originalname);
      data.image = await uploadFileIntoS3(req.file.buffer, extension);
    }

    const center = await ClinicAndCenter.create(data);
    res.status(201).json({ success: true, data: center });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update center
exports.updateCenter = async (req, res) => {
  try {
    let data = { ...req.body };

    // 1. Handle JSON parsing for keywords AND departments
    if (data.keywords && typeof data.keywords === "string") {
      data.keywords = JSON.parse(data.keywords);
    }

    // ADD THIS BLOCK
    if (data.departments && typeof data.departments === "string") {
      data.departments = JSON.parse(data.departments);
    }

    // 2. Handle New Image Upload to S3
    if (req.file) {
      const extension = getExtension(req.file.originalname);
      data.image = await uploadFileIntoS3(req.file.buffer, extension);
    }

    const center = await ClinicAndCenter.findByIdAndUpdate(
      req.params.id,
      data,
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

    // Image cleanup would happen here if a deleteS3Object utility is implemented
    await center.deleteOne();
    res.status(200).json({ success: true, message: "Center deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Seed centers
exports.seedClinicsAndCenters = async (req, res) => {
  try {
    const data = req.body;

    if (!Array.isArray(data) || data.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Provide an array" });
    }

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
