const mongoose = require("mongoose");

const clinicAndCenterSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a title for the clinic/center"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
    },
    location: {
      type: String, // To store "Building A, 15th floor" etc.
    },
    image: {
      type: String,
      default: "default-center.jpg",
    },
    // CHANGED: Array of Departments to support multiple associations
    departments: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Department",
        required: [true, "Please associate at least one department"],
      },
    ],
    // SEO Fields
    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
    keywords: [String],
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Auto-generate slug and basic SEO title
clinicAndCenterSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-")
      .trim();

    if (!this.metaTitle) this.metaTitle = this.title;
  }
  next();
});

module.exports = mongoose.model("ClinicAndCenter", clinicAndCenterSchema);
