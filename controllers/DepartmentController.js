const Department = require("../models/Department");
const fs = require("fs");
const path = require("path");
// @desc    Get all departments
// @route   GET /api/departments
// @access  Public
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true });
    res
      .status(200)
      .json({ success: true, count: departments.length, data: departments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single department by Slug
// @route   GET /api/departments/:slug
// @access  Public
exports.getDepartmentBySlug = async (req, res) => {
  try {
    // We populate 'doctors' (the virtual field) to show doctors in this department
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
// @access  Private (Admin)
exports.createDepartment = async (req, res) => {
  try {
    const department = await Department.create(req.body);
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
// @access  Private (Admin)
exports.updateDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
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
// @access  Private (Admin)
exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res
        .status(404)
        .json({ success: false, message: "Department not found" });
    }
    // trigger the pre('deleteOne') hook if defined
    await department.deleteOne();
    res.status(200).json({ success: true, message: "Department deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.seedDepartments = async (req, res) => {
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
        message: "Please provide an array of departments",
      });
    }

    // Option: Clear existing departments to avoid duplicate key errors?
    // await Department.deleteMany({});

    // Use insertMany for bulk creation
    // ordered: false ensures that if one fails (e.g. duplicate), the others still insert
    const departments = await Department.insertMany(data, { ordered: false });

    res.status(201).json({
      success: true,
      count: departments.length,
      data: departments,
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
