import userRoutes from "./routes/userRoutes.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import inboxRoutes from "./routes/inboxRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import workflowRoutes from "./routes/workflowRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Connect Database
connectDB();

// Test Route
app.get("/", (req, res) => {
  res.send("IntelliFlow Backend is Running...");
});

// Server Start
const PORT = process.env.PORT || 5000;
app.use("/api/auth", authRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/workflows", workflowRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/inbox", inboxRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
