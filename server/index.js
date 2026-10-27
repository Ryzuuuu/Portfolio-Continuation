import "dotenv/config";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import contactRouter from "./routes/contact.js";

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json({ limit: "10kb" }));
app.use("/api/contact", contactRouter);

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});

app.use((error, _request, response, _next) => {
  console.error("API request failed:", error);
  response.status(500).json({ error: "Something went wrong. Please try again." });
});

app.listen(port, () => {
  console.log(`Portfolio API listening on http://localhost:${port}`);
});

if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI).catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });
} else {
  console.warn("MONGODB_URI is not set. Contact form submissions will be unavailable.");
}
