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
    const data = req.body;

    // This line is the key: it wipes the collection so you can start fresh
    // Only use this in your local/staging environment to reset
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
