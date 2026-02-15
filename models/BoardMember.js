const mongoose = require("mongoose");

const boardMemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add the member's name"],
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
      unique: true,
      index: true,
    },
    designation: {
      type: String,
      required: [true, "Please add a designation"],
      trim: true,
    },
    image: {
      type: String,
      default: "default-member.jpg",
    },
    ranking: {
      type: Number,
      index: true,
    },
    bio: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },
  },
  { timestamps: true }
);

// Auto-Ranking & Slug Logic
boardMemberSchema.pre("save", async function (next) {
  if (this.isNew && !this.ranking) {
    try {
      const highestRanked = await this.constructor
        .findOne({}, "ranking")
        .sort({ ranking: -1 });
      this.ranking =
        highestRanked && highestRanked.ranking ? highestRanked.ranking + 1 : 1;
    } catch (err) {
      return next(err);
    }
  }

  if (this.isModified("name") && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-")
      .trim();
  }
  next();
});

module.exports = mongoose.model("BoardMember", boardMemberSchema);
