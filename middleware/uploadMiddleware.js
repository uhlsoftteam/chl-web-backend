const multer = require("multer");
const path = require("path");

/**
 * Switch to memoryStorage:
 * Files will be stored in RAM as a buffer instead of being written to disk.
 * This buffer is what you pass to your uploadFileIntoS3 function.
 */
const storage = multer.memoryStorage();

// Check file type (Maintains your existing logic for Images only)
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|webp|gif|svg|avif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Error: Images Only (jpeg, jpg, png, webp, gif, svg, avif)!"));
  }
}

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

module.exports = upload;
