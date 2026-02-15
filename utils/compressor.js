const sharp = require("sharp");
const path = require("path");

const compressImage = async (req, res, next) => {
  // If there's no file, move to the next middleware/controller
  if (!req.file) return next();

  try {
    // Perform the compression
    const compressedBuffer = await sharp(req.file.buffer)
      .resize(1200, null, {
        // Resize to max 1200px width
        withoutEnlargement: true,
        fit: "inside",
      })
      .webp({ quality: 80 }) // Convert to WebP for best compression
      .toBuffer();

    // Replace the original buffer with the compressed one
    req.file.buffer = compressedBuffer;

    // Update the mimetype and extension info for your S3 utility
    req.file.mimetype = "image/webp";
    req.file.originalname = `${path.parse(req.file.originalname).name}.webp`;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { compressImage };
