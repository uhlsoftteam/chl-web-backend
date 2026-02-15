const BoardMember = require("../models/BoardMember");
const { uploadFileIntoS3 } = require("../services/upload-file/uploadUtility");

const getExtension = (filename) => filename.split(".").pop().toLowerCase();

// @desc    Get all board members (ordered by ranking)
exports.getBoardMembers = async (req, res) => {
  try {
    const members = await BoardMember.find({ isActive: true }).sort({
      ranking: 1,
    });
    res
      .status(200)
      .json({ success: true, count: members.length, data: members });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create member
exports.createBoardMember = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.seo && typeof data.seo === "string")
      data.seo = JSON.parse(data.seo);

    if (req.file) {
      const extension = getExtension(req.file.originalname);
      data.image = await uploadFileIntoS3(req.file.buffer, extension);
    }

    const member = await BoardMember.create(data);
    res.status(201).json({ success: true, data: member });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update member
exports.updateBoardMember = async (req, res) => {
  try {
    let data = { ...req.body };
    if (data.seo && typeof data.seo === "string")
      data.seo = JSON.parse(data.seo);

    if (req.file) {
      const extension = getExtension(req.file.originalname);
      data.image = await uploadFileIntoS3(req.file.buffer, extension);
    }

    const member = await BoardMember.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });

    if (!member)
      return res.status(404).json({ success: false, message: "Not found" });
    res.status(200).json({ success: true, data: member });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Bulk reorder
exports.reorderBoardMembers = async (req, res) => {
  try {
    const { orderedIds } = req.body;
    const bulkOps = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { ranking: index + 1 } },
      },
    }));
    await BoardMember.bulkWrite(bulkOps);
    res.status(200).json({ success: true, message: "Reordered successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete member
exports.deleteBoardMember = async (req, res) => {
  try {
    const member = await BoardMember.findByIdAndDelete(req.params.id);
    if (!member)
      return res.status(404).json({ success: false, message: "Not found" });
    res.status(200).json({ success: true, message: "Member removed" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
