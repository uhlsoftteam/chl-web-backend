const News = require("../models/News");

// @desc    Get all published news
// @route   GET /api/news
// @access  Public
exports.getNews = async (req, res) => {
  try {
    const news = await News.find({ isPublished: true }).sort({
      publishedAt: -1,
    });
    res.status(200).json({ success: true, count: news.length, data: news });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single news item
// @route   GET /api/news/:id
// @access  Public
exports.getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news)
      return res
        .status(404)
        .json({ success: false, message: "News item not found" });
    res.status(200).json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create news item
// @route   POST /api/news
// @access  Private (Admin)
exports.createNews = async (req, res) => {
  try {
    if (req.file) {
      // This matches your app.use("/uploads", ...) config in app.js
      req.body.image = `/uploads/news/${req.file.filename}`;
    }

    // FormData sends Booleans as strings "true"/"false".
    // Mongoose usually handles this, but if you have issues, cast it:
    if (req.body.isPublished) {
      req.body.isPublished = req.body.isPublished === "true";
    }

    const news = await News.create(req.body);
    res.status(201).json({ success: true, data: news });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update news item
// @route   PUT /api/news/:id
// @access  Private (Admin)
// @desc    Update news item
// @route   PUT /api/news/:id
// @access  Private (Admin)
exports.updateNews = async (req, res) => {
  try {
    let news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News item not found",
      });
    }

    // 1. Handle New Image Upload
    if (req.file) {
      // Set the new path for the database
      req.body.image = `/uploads/news/${req.file.filename}`;

      // Note: req.file is populated by the 'upload.single' middleware
      // added to your route file.
    }

    // 2. Handle FormData types (Booleans/Arrays)
    // FormData sends Booleans as strings like "true" or "false"
    if (req.body.isPublished !== undefined) {
      req.body.isPublished = req.body.isPublished === "true";
    }

    // If you have tags or other JSON objects in News
    if (req.body.tags && typeof req.body.tags === "string") {
      try {
        req.body.tags = JSON.parse(req.body.tags);
      } catch (e) {
        // Keep as is if parsing fails
      }
    }

    // 3. Update in Database
    news = await News.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: news });
  } catch (error) {
    console.error("Update News Error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete news item
// @route   DELETE /api/news/:id
// @access  Private (Admin)
exports.deleteNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news)
      return res
        .status(404)
        .json({ success: false, message: "News item not found" });
    await news.deleteOne();
    res.status(200).json({ success: true, message: "News item deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
