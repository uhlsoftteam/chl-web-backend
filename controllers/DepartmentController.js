const Department = require("../models/Department");
const { uploadFileIntoS3 } = require("../services/upload-file/uploadUtility");

// Helper to get extension
const getExtension = (filename) => filename.split(".").pop().toLowerCase();

// @desc    Get all departments
// @route   GET /api/departments
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true });
    res.status(200).json({
      success: true,
      count: departments.length,
      data: departments,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single department by Slug
// @route   GET /api/departments/:slug
exports.getDepartmentBySlug = async (req, res) => {
  try {
    const department = await Department.findOne({
      slug: req.params.slug,
    }).populate("doctors");

    if (!department) {
      return res
        .status(404)
        .json({ success: false, message: "Department not found" });
    }

    res.status(200).json({ success: true, data: department });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create new department
// @route   POST /api/departments
exports.createDepartment = async (req, res) => {
  try {
    const data = { ...req.body };

    // Handle Image Upload to S3 if a file is attached
    if (req.file) {
      const extension = getExtension(req.file.originalname);
      data.image = await uploadFileIntoS3(req.file.buffer, extension);
    }

    const department = await Department.create(data);
    res.status(201).json({ success: true, data: department });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ success: false, error: "Department already exists" });
    }
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
exports.updateDepartment = async (req, res) => {
  try {
    const data = { ...req.body };

    // Handle New Image Upload to S3
    if (req.file) {
      const extension = getExtension(req.file.originalname);
      data.image = await uploadFileIntoS3(req.file.buffer, extension);
    }

    const department = await Department.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });

    if (!department) {
      return res
        .status(404)
        .json({ success: false, message: "Department not found" });
    }

    res.status(200).json({ success: true, data: department });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res
        .status(404)
        .json({ success: false, message: "Department not found" });
    }

    await department.deleteOne();
    res.status(200).json({ success: true, message: "Department deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Seed departments
exports.seedDepartments = async (req, res) => {
  try {
    const data = req.body;

    // Reset collection
    await Department.deleteMany({});

    const preparedData = data.map((dept) => ({
      ...dept,
      slug: dept.name
        .toLowerCase()
        .replace(/[^\w ]+/g, "")
        .replace(/ +/g, "-")
        .trim(),
    }));

    const departments = await Department.insertMany(preparedData);

    res.status(201).json({
      success: true,
      count: departments.length,
      data: departments,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
