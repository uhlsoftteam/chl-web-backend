const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const mime = require("mime-types");

const singleImageUploadLimit = process.env.SINGLE_IMAGE_UPLOAD_LIMIT || 5;

// Constants for valid image extensions
const validImageExtensions = ["jpg", "jpeg", "png", "gif", "svg", "avif"];

// Constants for valid document extensions
const validDocumentExtensions = ["pdf", "doc", "docx", "txt", ...validImageExtensions];

// Function to generate a random alphanumeric string
const generateRandomString = () => {
    const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
    let randomString = "";
    for (let i = 0; i < 12; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters.charAt(randomIndex);
    }
    return randomString;
};

// Function to get content type based on file extension
const getFileContentType = (extension) => {
    const mimeType = mime.lookup(extension);
    return mimeType || "application/octet-stream";
};

// Function to convert bytes to megabytes
const bytesToMB = (bytes) => {
    return bytes / (1024 * 1024); // 1 MB = 1024 * 1024 bytes
};

const uploadFileIntoS3 = async (file, extension) => {
    const ext = extension;
    const key = `${Date.now()}-${generateRandomString(8)}.${ext}`;
    const options = {
        Bucket: process.env.S3_BUCKET_NAME, // Use the environment variable directly
        Key: key,
        Body: file,
        ContentType: "image/jpeg",
    };

    try {
        await s3.upload(options).promise();
        console.log(`File uploaded into S3 bucket: "${process.env.S3_BUCKET_NAME}", with key: "${options.Key}"`);

        // Construct and return the file location URL
        const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.ap-southeast-1.amazonaws.com/${key}`;
        return fileUrl;
    } catch (err) {
        console.error(err);
        throw err;
    }
};

module.exports = {
    singleImageUploadLimit,
    validImageExtensions,
    validDocumentExtensions,
    generateRandomString,
    getFileContentType,
    bytesToMB,
    uploadFileIntoS3,
};
