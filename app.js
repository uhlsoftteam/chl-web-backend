const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const serverless = require("serverless-http");
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

// Base route
// comment this , only for testing
app.get("/api/hello", (req, res) => {
    // Log MongoDB URI
    console.log("MongoDB URI:", process.env.MONGODB_URI);

    res.json({ message: "Hello, world!" });
});

// Wrap the app with serverless-http middleware for serverless deployment
module.exports.handler = serverless(app);
