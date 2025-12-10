const mongoose = require("mongoose");

const PackageSchema = new mongoose.Schema(
  {
    // --- Basic Package Info ---
    packageName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    packageSlug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    // Added packageNature field
    packageNature: {
      type: String, // e.g., "Corporate", "HEALTH SCREENING", "UHL STAFF"
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    is_opd: {
      type: Boolean,
      default: true,
    },
    is_ipd: {
      type: Boolean,
      default: false,
    },
    opd_amount: {
      type: Number,
      min: 0,
    },
    ipd_amount: {
      type: Number,
      min: 0,
    },

    // --- Target Audience Info ---
    targetAudience: {
      ageRange: {
        type: String,
        trim: true,
      },
      gender: {
        type: String,
        enum: ["Male", "Female", "All"],
        required: true,
      },
      // Department is optional and will be skipped in JSON if not present
      department: {
        type: String,
        trim: true,
      },
      preCondition: {
        type: String,
        trim: true,
      },
    },

    details: {
      type: String,
      required: true,
    },

    // --- Media and SEO Fields ---
    packageImage: {
      url: String,
      altText: String,
    },

    seo: {
      metaTitle: {
        type: String,
        trim: true,
        maxlength: 70,
      },
      metaDescription: {
        type: String,
        trim: true,
        maxlength: 160,
      },
      keywords: [String],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Package", PackageSchema);
