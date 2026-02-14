const Package = require("../models/Package");
const { uploadFileIntoS3 } = require("../services/upload-file/uploadUtility");

// Helper to get extension
const getExtension = (filename) => filename.split(".").pop().toLowerCase();

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

// @desc    Create new package
// @route   POST /api/v1/packages
exports.createPackage = async (req, res, next) => {
  try {
    let data = { ...req.body };

    // 1. Robust Parsing for FormData strings
    ["targetAudience", "seo"].forEach((field) => {
      if (data[field] && typeof data[field] === "string") {
        try {
          data[field] = JSON.parse(data[field]);
        } catch (e) {
          throw new Error(`Invalid JSON format for ${field}`);
        }
      }
    });

    // 2. Handle Image Upload to S3
    if (req.file) {
      const extension = getExtension(req.file.originalname);
      const s3Url = await uploadFileIntoS3(req.file.buffer, extension);

      data.packageImage = {
        url: s3Url,
        altText: data.packageName || "Package Image",
      };
    }

    // 3. Create the Package
    const package = await Package.create(data);
    res.status(201).json({ success: true, data: package });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ success: false, error: "Package name or slug already exists" });
    }
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update package by ID
// @route   PUT /api/v1/packages/:id
exports.updatePackage = async (req, res, next) => {
  try {
    let updateData = { ...req.body };

    // 1. Parse JSON strings for nested objects
    ["targetAudience", "seo"].forEach((field) => {
      if (updateData[field] && typeof updateData[field] === "string") {
        try {
          updateData[field] = JSON.parse(updateData[field]);
        } catch (e) {
          throw new Error(`Invalid JSON format for ${field}`);
        }
      }
    });

    // 2. Handle New Image Upload to S3
    if (req.file) {
      const extension = getExtension(req.file.originalname);
      const s3Url = await uploadFileIntoS3(req.file.buffer, extension);

      updateData.packageImage = {
        url: s3Url,
        altText: updateData.packageName || "Updated Package Image",
      };
    }

    // 3. Update in Database
    const updatedPackage = await Package.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedPackage) {
      return res
        .status(404)
        .json({ success: false, error: "Package not found" });
    }

    res.status(200).json({ success: true, data: updatedPackage });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ success: false, error: "Package name or slug already exists" });
    }
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Search Packages
exports.searchPackages = async (req, res, next) => {
  try {
    const { query, gender, packageNature, is_opd } = req.query;
    let filter = {};

    if (query) {
      filter.$or = [
        { packageName: { $regex: query, $options: "i" } },
        { packageNature: { $regex: query, $options: "i" } },
        { details: { $regex: query, $options: "i" } },
        { "targetAudience.department": { $regex: query, $options: "i" } },
      ];
    }

    if (gender) filter["targetAudience.gender"] = gender;
    if (packageNature) filter.packageNature = packageNature;
    if (is_opd) filter.is_opd = is_opd === "true";

    const packages = await Package.find(filter);

    res
      .status(200)
      .json({ success: true, count: packages.length, data: packages });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Seed Packages
exports.seedPackages = async (req, res) => {
  try {
    const data = req.body;
    if (!Array.isArray(data) || data.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Provide an array of packages" });
    }

    const packages = await Package.insertMany(data, { ordered: false });
    res
      .status(201)
      .json({ success: true, count: packages.length, data: packages });
  } catch (error) {
    if (error.code === 11000 || error.writeErrors) {
      return res.status(207).json({
        success: true,
        message: "Process completed with some duplicate errors skipped.",
        inserted: error.insertedDocs ? error.insertedDocs.length : "Unknown",
      });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};
