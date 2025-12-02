const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a headline"],
      trim: true,
      maxlength: [100, "Headline cannot be more than 100 characters"],
    },
    // SEO: News needs slugs too
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, "Please add content"],
    },
    summary: {
      type: String,
      maxlength: [500, "Summary cannot be more than 500 characters"],
    },
    source: {
      type: String,
      default: "Internal",
    },
    thumbnail: {
      type: String,
      default: "no-photo.jpg",
    },
    // SEO: Alt text
    imageAlt: {
      type: String,
      default: "News thumbnail",
    },
    // SEO Specific Fields
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
  {
    timestamps: true,
  }
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
