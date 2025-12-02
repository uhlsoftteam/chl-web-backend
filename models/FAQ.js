const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Question is required"],
      trim: true,
    },
    answer: {
      type: String,
      required: [true, "Answer is required"],
      trim: true,
    },
    category: {
      type: String,
      default: "General",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Optional: Index for faster searching if you have many FAQs
faqSchema.index({ question: "text", answer: "text" });

module.exports = mongoose.model("FAQ", faqSchema);
