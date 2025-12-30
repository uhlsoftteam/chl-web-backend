const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a headline"],
      trim: true,
      maxlength: [100, "Headline cannot be more than 100 characters"],
    },
    // NEW: Type of news
    contentType: {
      type: String,
      enum: ["article", "video", "external"],
      default: "article",
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    // Optional for external/video types
    content: {
      type: String,
      required: function () {
        return this.contentType === "article";
      },
    },
    // NEW: For YouTube/Vimeo links
    videoUrl: {
      type: String,
      validate: {
        validator: function (v) {
          return (
            !v ||
            /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com)/.test(v)
          );
        },
        message: "Please provide a valid video URL",
      },
    },
    // NEW: For linking to other medical journals/sites
    externalUrl: {
      type: String,
    },
    summary: {
      type: String,
      maxlength: [500, "Summary cannot be more than 500 characters"],
    },
    source: {
      type: String,
      default: "Internal Medical Team", // Good for authority
    },
    thumbnail: {
      type: String,
      default: "no-photo.jpg",
    },
    imageAlt: {
      type: String,
      default: "Medical news illustration",
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Create slug from title before saving
newsSchema.pre("save", function (next) {
  if (this.isModified("title") && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");
  }
  next();
});

module.exports = mongoose.model("News", newsSchema);
