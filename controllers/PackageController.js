const Package = require("../models/Package");

// @desc    Get all packages
// @route   GET /api/v1/packages
exports.getPackages = async (req, res, next) => {
  try {
    const packages = await Package.find();
    res
      .status(200)
      .json({ success: true, count: packages.length, data: packages });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get single package by slug
// @route   GET /api/v1/packages/:slug
exports.getPackageBySlug = async (req, res, next) => {
  try {
    const package = await Package.findOne({ packageSlug: req.params.slug });

    if (!package) {
      return res
        .status(404)
        .json({ success: false, error: "Package not found" });
    }

    res.status(200).json({ success: true, data: package });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Create new package (Requires Auth/Admin middleware)
// @route   POST /api/v1/packages
exports.createPackage = async (req, res, next) => {
  try {
    const package = await Package.create(req.body);
    res.status(201).json({ success: true, data: package });
  } catch (error) {
    // Handle validation and duplicate errors
    if (error.code === 11000) {
      // 11000 is MongoDB's duplicate key error code
      return res
        .status(400)
        .json({ success: false, error: "Package name or slug already exists" });
    }
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update package by ID (Requires Auth/Admin middleware)
// @route   PUT /api/v1/packages/:id
exports.updatePackage = async (req, res, next) => {
  try {
    const package = await Package.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Return the updated document
      runValidators: true, // Run schema validators
    });

    if (!package) {
      return res
        .status(404)
        .json({ success: false, error: "Package not found" });
    }

    res.status(200).json({ success: true, data: package });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
