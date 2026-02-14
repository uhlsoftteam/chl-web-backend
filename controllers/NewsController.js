const News = require("../models/News");
const mongoose = require("mongoose");
const { uploadFileIntoS3 } = require("../services/upload-file/uploadUtility");

// Helper to get extension
const getExtension = (filename) => filename.split(".").pop().toLowerCase();

// @desc    Get all published news
// @route   GET /api/news
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
exports.createNews = async (req, res) => {
  try {
    const data = { ...req.body };

    // 1. Handle Thumbnail Logic (S3 vs External URL)
    if (req.file) {
      // Manual upload to S3
      const extension = getExtension(req.file.originalname);
      data.thumbnail = await uploadFileIntoS3(req.file.buffer, extension);
    } else if (data.thumbnail && data.thumbnail.startsWith("http")) {
      // Keep as is if it's a YouTube thumbnail URL
    }

    // 2. Handle JSON/FormData boolean quirks
    if (data.isPublished !== undefined) {
      data.isPublished = data.isPublished === "true";
    }

    // 3. Auto-set source if it's a YouTube link
    if (data.contentType === "video" && data.videoUrl?.includes("youtube")) {
      data.source = "YouTube";
    }

    const news = await News.create(data);
    res.status(201).json({ success: true, data: news });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update news item
exports.updateNews = async (req, res) => {
  try {
    let data = { ...req.body };

    // 1. Handle Thumbnail Logic
    if (req.file) {
      const extension = getExtension(req.file.originalname);
      data.thumbnail = await uploadFileIntoS3(req.file.buffer, extension);
    }

    // 2. Fix Boolean strings from FormData
    if (data.isPublished !== undefined) {
      data.isPublished = data.isPublished === "true";
    }

    // 3. Clear content if external
    if (data.contentType === "external") {
      data.content = "";
    }

    const updatedNews = await News.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });

    if (!updatedNews)
      return res.status(404).json({ success: false, message: "Not found" });

    res.status(200).json({ success: true, data: updatedNews });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete news item
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

// @desc    Get news by Slug or ID
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
