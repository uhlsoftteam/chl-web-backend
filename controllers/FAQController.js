const FAQ = require("../models/FAQ");

// @desc    Get all FAQs (Public)
// @route   GET /api/faqs
exports.getFAQs = async (req, res) => {
  try {
    // Usually, public users only see active FAQs, sorted by displayOrder
    const faqs = await FAQ.find({ isActive: true }).sort({ displayOrder: 1 });

    res.status(200).json({
      success: true,
      count: faqs.length,
      data: faqs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get all FAQs including inactive (Admin)
// @route   GET /api/faqs/admin
exports.getAllFAQsAdmin = async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: faqs.length,
      data: faqs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Create a new FAQ
// @route   POST /api/faqs
exports.createFAQ = async (req, res) => {
  try {
    const { question, answer, category, displayOrder } = req.body;

    const faq = await FAQ.create({
      question,
      answer,
      category,
      displayOrder,
    });

    res.status(201).json({
      success: true,
      data: faq,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ success: false, message: messages });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Update an FAQ
// @route   PUT /api/faqs/:id
exports.updateFAQ = async (req, res) => {
  try {
    let faq = await FAQ.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({ success: false, message: "FAQ not found" });
    }

    faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: faq,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Delete an FAQ
// @route   DELETE /api/faqs/:id
exports.deleteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({ success: false, message: "FAQ not found" });
    }

    await faq.deleteOne();

    res.status(200).json({
      success: true,
      message: "FAQ removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
