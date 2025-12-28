const mongoose = require("mongoose");
const slugify = require("slugify");

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
  if (this.isModified("title")) {
    // বাংলা এবং ইংরেজি উভয় অক্ষর সাপোর্ট করার জন্য এই Regex ব্যবহার করুন
    this.slug = this.title
      .trim()
      .toLowerCase()
      .replace(/[^\u0000-\u007F\u0980-\u09FF\s]/g, "") // শুধু ইংরেজি এবং বাংলা অক্ষর রাখবে
      .replace(/\s+/g, "-") // স্পেসকে ড্যাশ করবে
      .replace(/-+/g, "-"); // ডবল ড্যাশ সিঙ্গেল করবে

    // যদি টাইটেল থেকে স্লাগ তৈরি করতে ব্যর্থ হয় (নিরাপত্তার জন্য)
    if (!this.slug || this.slug === "-") {
      this.slug = `post-${Date.now()}`;
    }
  }
  next();
});

module.exports = mongoose.model("Blog", blogSchema);
