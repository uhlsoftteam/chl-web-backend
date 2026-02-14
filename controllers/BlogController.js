const Blog = require("../models/Blog");
const { uploadFileIntoS3 } = require("../services/upload-file/uploadUtility");

// Helper to get extension
const getExtension = (filename) => filename.split(".").pop().toLowerCase();

// @desc    Get all published blogs
// @route   GET /api/blogs
exports.getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ status: "published" })
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: blogs.length, data: blogs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single blog by Slug
// @route   GET /api/blogs/:slug
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
exports.createBlog = async (req, res) => {
  try {
    const data = { ...req.body };

    // 1. Handle S3 Image Upload
    if (req.file) {
      const extension = getExtension(req.file.originalname);
      data.coverImage = await uploadFileIntoS3(req.file.buffer, extension);
    }

    // 2. Parse JSON strings back into objects/arrays
    if (data.tags && typeof data.tags === "string")
      data.tags = JSON.parse(data.tags);
    if (data.seo && typeof data.seo === "string")
      data.seo = JSON.parse(data.seo);

    // 3. Set the author from the authenticated user
    data.author = req.user.id;

    const blog = await Blog.create(data);
    res.status(201).json({ success: true, data: blog });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update blog post
// @route   PUT /api/blogs/:id
exports.updateBlog = async (req, res) => {
  try {
    const data = { ...req.body };
    let blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    // 1. Handle New S3 Image Upload
    if (req.file) {
      const extension = getExtension(req.file.originalname);
      data.coverImage = await uploadFileIntoS3(req.file.buffer, extension);
    }

    // 2. Parse JSON strings (tags and seo)
    if (data.tags && typeof data.tags === "string") {
      try {
        data.tags = JSON.parse(data.tags);
      } catch (e) {
        /* ignore */
      }
    }
    if (data.seo && typeof data.seo === "string") {
      try {
        data.seo = JSON.parse(data.seo);
      } catch (e) {
        /* ignore */
      }
    }

    // 3. Update the document
    blog = await Blog.findByIdAndUpdate(req.params.id, data, {
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
    if (error.kind === "ObjectId") {
      return res
        .status(404)
        .json({ success: false, message: "Invalid ID format" });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};
