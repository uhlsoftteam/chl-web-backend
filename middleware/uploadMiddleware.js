// backend/middleware/uploadMiddleware.js
const multer = require("multer");
const path = require("path");

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = "others"; // Default folder

    // Check the URL to determine the folder
    if (req.baseUrl.includes("doctors")) {
      folder = "doctors";
    } else if (req.baseUrl.includes("blogs")) {
      folder = "blogs";
    } else if (req.baseUrl.includes("packages")) {
      folder = "packages";
    }

    const uploadPath = `./public/uploads/${folder}`;
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// Check file type (Images only)
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only (jpeg, jpg, png, webp)!");
  }
}

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

module.exports = upload;
