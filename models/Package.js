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
      // URL-friendly identifier for routes/SEO
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    is_opd: {
      // True if it's an OPD package
      type: Boolean,
      default: true,
    },
    is_ipd: {
      // True if it's an IPD package
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
        type: String, // e.g., "20-45"
        trim: true,
      },
      gender: {
        type: String, // e.g., "Female"
        enum: ["Male", "Female", "All"],
        required: true,
      },
      department: {
        type: String, // e.g., "Internal Medicine"
        trim: true,
      },
      preCondition: {
        type: String, // e.g., "OPD"
        trim: true,
      },
    },

    details: {
      type: String,
      required: true,
    },

    // --- Media and SEO Fields ---
    packageImage: {
      // The main image for the package
      url: String,
      altText: String,
    },

    // SEO Fields
    seo: {
      metaTitle: {
        // Appears in the browser tab and search results
        type: String,
        trim: true,
        maxlength: 70,
      },
      metaDescription: {
        // The snippet under the title in search results
        type: String,
        trim: true,
        maxlength: 160,
      },
      keywords: [String], // Keywords for search engines
    },
  },
  { timestamps: true }
); // Automatically adds createdAt and updatedAt fields

module.exports = mongoose.model("Package", PackageSchema);
