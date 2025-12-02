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
    const news = await News.create(req.body);
    res.status(201).json({ success: true, data: news });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update news item
// @route   PUT /api/news/:id
// @access  Private (Admin)
exports.updateNews = async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!news)
      return res
        .status(404)
        .json({ success: false, message: "News item not found" });
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
