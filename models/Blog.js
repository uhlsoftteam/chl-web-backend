const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a title"],
      trim: true,
      unique: true,
    },
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
    author: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    tags: {
      type: [String],
      index: true,
    },
    coverImage: {
      type: String,
      default: "no-photo.jpg",
    },
    // SEO: Alt text for the blog cover image
    imageAlt: {
      type: String,
      default: "Blog cover image",
    },
    // SEO Specific Fields
    seo: {
      metaTitle: String,
      metaDescription: String,
      canonicalUrl: String, // Useful if you are reposting content
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  }
);

// Create slug from title before saving
blogSchema.pre("save", function (next) {
  if (this.isModified("title") && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");
  }
  next();
});

module.exports = mongoose.model("Blog", blogSchema);
