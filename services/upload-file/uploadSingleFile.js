const AWS = require("aws-sdk"); // Import AWS SDK
const s3 = new AWS.S3(); // Create S3 client
const Multipart = require("lambda-multipart"); // Import lambda-multipart for parsing multipart form data
const createError = require("http-errors"); // Import http-errors for creating HTTP errors
const {
  validDocumentExtensions,
  validImageExtensions,
  singleImageUploadLimit,
  singleDocumentUploadLimit,
  bytesToMB,
  uploadFileIntoS3,
} = require("./uploadUtility"); // Import utility functions from uploadUtility module

exports.handler = async (event) => {
  try {
    const { fileType } = event.pathParameters; // Extract fileType from path parameters

    // Determine the upload limit based on the fileType
    const uploadLimit =
      fileType === "image" ? singleImageUploadLimit : singleDocumentUploadLimit;

    // Handle file upload - Parse multipart form data
    const { fields, files } = await parseMultipartFormData(event);

    // Validate file sizes for the first file only
    const firstFile = files[0];
    const fileSizeMB = bytesToMB(firstFile.data);
    if (fileSizeMB > uploadLimit) {
      // Check if file size exceeds the upload limit
      throw createError(
        400,
        `File size exceeds the upload limit of ${uploadLimit} MB.`
      );
    }

    // Validate file name and extension for the first file only
    const { filename } = firstFile;
    if (!filename || filename.trim() === "") {
      // Check if filename is empty or whitespace
      throw createError(400, "File name cannot be empty.");
    }

    const extension = filename.split(".").pop().toLowerCase(); // Extract file extension
    if (
      !validImageExtensions.includes(extension) && // Check if file extension is valid
      !validDocumentExtensions.includes(extension)
    ) {
      throw createError(400, `Invalid file extension: ${extension}`);
    }

    // Use Promise.all to asynchronously upload files and collect their URLs
    const fileUrls = await Promise.all(
      files.map(async (file) => {
        try {
          return await uploadFileIntoS3(file, extension);
        } catch (uploadError) {
          // Handle upload error for individual file
          throw createError(500, `Failed to upload file: ${file.filename}`);
        }
      })
    );

    // Get the URL of the first uploaded file
    const firstFileUrl = fileUrls.length > 0 ? fileUrls[0] : null;

    // Return only the URL of the first uploaded file
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // or specific origin e.g., "https://example.com"
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
      },
      body: JSON.stringify({ fileUrl: firstFileUrl }),
    };
  } catch (error) {
    // Catch any errors that occur during execution
    return {
      statusCode: error.statusCode || 500,
      headers: {
        "Access-Control-Allow-Origin": "*", // or specific origin e.g., "https://example.com"
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
};

// Function to parse multipart form data
const parseMultipartFormData = async (event) => {
  return new Promise((resolve, reject) => {
    const parser = new Multipart(event); // Create multipart parser

    parser.on("finish", (result) => {
      // When parsing is finished, resolve with fields and files
      resolve({ fields: result.fields, files: result.files });
    });

    parser.on("error", (error) => {
      // If parsing encounters an error, reject with the error
      return reject(error);
    });
  });
};
