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
    // Add user from token to body
    req.body.author = req.user.id;

    const blog = await Blog.create(req.body);
    res.status(201).json({ success: true, data: blog });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update blog post
// @route   PUT /api/blogs/:id
// @access  Private (Admin)
exports.updateBlog = async (req, res) => {
  try {
    let blog = await Blog.findById(req.params.id);
    if (!blog)
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });

    // Optional: Ensure only the original author OR an admin can update
    // For now, since route is isAdmin, we assume admins can edit any blog.

    blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: blog });
  } catch (error) {
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
