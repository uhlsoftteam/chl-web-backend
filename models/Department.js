const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a department name"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      // maxlength: [500, "Description can not be more than 500 characters"],
    },
    image: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create slug from name
departmentSchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-")
      .trim();
  }
  next();
});

// Cascade delete: delete doctors when a department is deleted
// (Optional: Enable only if you want this behavior)
departmentSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    console.log(`Doctors being removed from department ${this._id}`);
    await this.model("Doctor").deleteMany({ department: this._id });
    next();
  }
);

// Reverse populate with virtuals (Optional: to see list of doctors inside department)
departmentSchema.virtual("doctors", {
  ref: "Doctor",
  localField: "_id",
  foreignField: "department",
  justOne: false,
});

module.exports = mongoose.model("Department", departmentSchema);
