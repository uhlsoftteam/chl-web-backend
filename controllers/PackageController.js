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

exports.seedPackages = async (req, res) => {
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
        message: "Please provide an array of packages",
      });
    }

    // Option: Clear existing departments to avoid duplicate key errors?
    // await Department.deleteMany({});

    // Use insertMany for bulk creation
    // ordered: false ensures that if one fails (e.g. duplicate), the others still insert
    const packages = await Package.insertMany(data, { ordered: false });

    res.status(201).json({
      success: true,
      count: packages.length,
      data: packages,
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
