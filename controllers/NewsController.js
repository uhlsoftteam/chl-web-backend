const News = require("../models/News");

// @desc    Get all published news
// @route   GET /api/news
// @access  Public
exports.getNews = async (req, res) => {
  try {
    // We fetch everything, but we sort by date
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
    // Handle Image
    if (req.file) {
      req.body.thumbnail = `/uploads/news/${req.file.filename}`;
    }

    // Handle JSON/FormData quirks
    if (req.body.isPublished)
      req.body.isPublished = req.body.isPublished === "true";

    // Logic: If it's a video, maybe you want to auto-set the source to 'YouTube'
    if (
      req.body.contentType === "video" &&
      req.body.videoUrl?.includes("youtube")
    ) {
      req.body.source = "YouTube";
    }

    const news = await News.create(req.body);
    res.status(201).json({ success: true, data: news });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.updateNews = async (req, res) => {
  try {
    let news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    // 1. Handle New Image Upload (Your existing logic)
    if (req.file) {
      req.body.thumbnail = `/uploads/news/${req.file.filename}`;
    }

    // 2. Fix Boolean strings from FormData
    if (req.body.isPublished !== undefined) {
      req.body.isPublished = req.body.isPublished === "true";
    }

    // 3. Clear data that doesn't belong
    // Logic: If they switched to 'external', clear the 'content' field to save space
    if (req.body.contentType === "external") {
      req.body.content = "";
    }

    news = await News.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: news });
  } catch (error) {
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

exports.getNewsBySlugOrId = async (req, res) => {
  try {
    const query = mongoose.Types.ObjectId.isValid(req.params.id)
      ? { _id: req.params.id }
      : { slug: req.params.id };

    const news = await News.findOne(query);

    if (!news)
      return res
        .status(404)
        .json({ success: false, message: "News not found" });
    res.status(200).json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
