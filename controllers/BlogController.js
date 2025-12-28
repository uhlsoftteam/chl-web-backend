const Blog = require("../models/Blog");

// @desc    Get all published blogs
// @route   GET /api/blogs
// @access  Public
exports.getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ status: "published" })
      .populate("author", "name email") // Show author details
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: blogs.length, data: blogs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single blog by Slug
// @route   GET /api/blogs/:slug
// @access  Public
exports.getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug }).populate(
      "author",
      "name"
    );
    console.log(blog);

    if (!blog)
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create blog post
// @route   POST /api/blogs
// @access  Private (Admin)
exports.createBlog = async (req, res) => {
  try {
    // 1. Check if file exists and add path to body
    if (req.file) {
      // Adjusted to match your static folder config
      req.body.coverImage = `/uploads/blogs/${req.file.filename}`;
    }

    // 2. Parse JSON strings back into objects/arrays
    if (req.body.tags) req.body.tags = JSON.parse(req.body.tags);
    if (req.body.seo) req.body.seo = JSON.parse(req.body.seo);

    // 3. Set the author (This was where it crashed because req.body was undefined)
    req.body.author = req.user.id;

    const blog = await Blog.create(req.body);
    res.status(201).json({ success: true, data: blog });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update blog post
// @route   PUT /api/blogs/:id
// @access  Private (Admin)
exports.updateBlog = async (req, res) => {
  try {
    let blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    // 1. Handle New Image Upload
    if (req.file) {
      // If a new file is uploaded, update the path
      req.body.coverImage = `/uploads/blogs/${req.file.filename}`;

      // OPTIONAL: You could add logic here to delete the OLD file from
      // the filesystem using the 'fs' module to save server space.
    }

    // 2. Parse JSON strings (tags and seo)
    if (req.body.tags) {
      try {
        req.body.tags = JSON.parse(req.body.tags);
      } catch (e) {
        // Fallback if it's already an array or malformed
      }
    }

    if (req.body.seo) {
      try {
        req.body.seo = JSON.parse(req.body.seo);
      } catch (e) {
        // Fallback
      }
    }

    // 3. Update the document
    blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete blog post
// @route   DELETE /api/blogs/:id
// @access  Private (Admin)
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog)
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    await blog.deleteOne();
    res.status(200).json({ success: true, message: "Blog post removed" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single blog by ID
// @route   GET /api/blogs/id/:id
// @access  Public (or Private depending on your need)
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate(
      "author",
      "name email"
    );

    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    // Check if the error is a CastError (invalid MongoDB ID)
    if (error.kind === "ObjectId") {
      return res
        .status(404)
        .json({ success: false, message: "Invalid ID format" });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};
