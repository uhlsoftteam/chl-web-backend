const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

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

const app = express();
app.use(cors());
const port = process.env.PORT || 5000;

// Body parser (Crucial for req.body to work in controllers)
app.use(express.json());

// Mount routers
app.use("/api/auth", authRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/packages", packageRoutes);

// Base route
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });
