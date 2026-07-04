import express from "express";
import cors from "cors";

import router from "./routes/recommend.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health Check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// API
app.use("/api/recommend", router);

// 404
app.use((_req, res) => {
  res.status(404).json({
    error: "Not Found",
  });
});

// Error Handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);

  res.status(500).json({
    error: "Internal Server Error",
  });
});

export default app;