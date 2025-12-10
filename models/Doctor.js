const mongoose = require("mongoose");

// Sub-schema for Schedule
const scheduleSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
      enum: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add the doctor's name"],
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
      index: true,
    },
    priority: {
      type: Number,
      default: 3, // Default to lowest priority so they don't jump to the top
      index: true,
    },

    // EXISTING: Ranking Field (Secondary Sort - Drag and Drop)
    ranking: {
      type: Number,
      index: true,
    },
    designation: {
      type: String,
      required: [true, "Please add a designation"],
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Please add a department"],
    },
    image: {
      type: String,
      default: "default-doctor.jpg",
    },
    imageAlt: {
      type: String,
      default: "Doctor profile picture",
    },
    location: {
      type: String,
      required: [true, "Please add a location"],
    },
    degrees: {
      type: [String],
      required: [true, "Please add degrees"],
    },
    experience: {
      type: [String],
    },
    schedules: [scheduleSchema],
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// COMBINED PRE-SAVE HOOK
// Handles both Slug generation AND Auto-Ranking
doctorSchema.pre("save", async function (next) {
  // 1. Handle Auto-Ranking for New Doctors
  // Only run this if the document is new and ranking wasn't manually provided
  if (this.isNew && !this.ranking) {
    try {
      // Find the doctor with the highest ranking
      const highestRankedDoctor = await this.constructor
        .findOne({}, "ranking")
        .sort({ ranking: -1 });

      // If a doctor exists, add 1 to their rank. If not (first doc), rank is 1.
      this.ranking =
        highestRankedDoctor && highestRankedDoctor.ranking
          ? highestRankedDoctor.ranking + 1
          : 1;
    } catch (err) {
      return next(err);
    }
  }

  // 2. Handle Slug Generation
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-")
      .trim();
  }

  next();
});

module.exports = mongoose.model("Doctor", doctorSchema);
