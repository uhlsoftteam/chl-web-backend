const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const serverless = require("serverless-http");
const createError = require("http-errors");
// Load env vars
dotenv.config();

// Route files
const authRoutes = require("./routes/auth");
const faqRoutes = require("./routes/faq");
const newsRoutes = require("./routes/news");
const blogRoutes = require("./routes/blog");
const doctorRoutes = require("./routes/doctor");
const departmentRoutes = require("./routes/department");
const packageRoutes = require("./routes/package");
const appointmentRoutes = require("./routes/appointment");
const clinicAndCenterRoutes = require("./routes/clinicAndCenters");
const boardMemberRoutes = require("./routes/boardMember");
const connectDB = require("./db/connectDB");

const app = express();
app.use(cors());
const port = process.env.PORT || 5000;

// Body parser (Crucial for req.body to work in controllers)
app.use(express.json({ limit: "50mb" }));

connectDB();

app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Mount routers
app.use("/api/auth", authRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/clinics-and-centers", clinicAndCenterRoutes);
app.use("/api/board-members", boardMemberRoutes);

// Base route
// comment this , only for testing
app.get("/api/hello", (req, res) => {
  // Log MongoDB URI
  console.log("MongoDB URI:", process.env.MONGODB_URI);

  res.json({ message: "Hello, world! This is an Emergency" });
});

app.use(async (req, res, next) => {
  next(createError.NotFound("This route does not exist!"));
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});
// Wrap the app with serverless-http middleware for serverless deployment
module.exports.handler = serverless(app);
