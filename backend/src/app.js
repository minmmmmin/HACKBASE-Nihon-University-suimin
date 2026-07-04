import cors from "cors";
import express from "express";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { healthRouter } from "./routes/health.js";
import { recommendRouter } from "./routes/recommend.js";

/**
 * Expressアプリケーションを生成して設定する。
 *
 * @returns {import("express").Express}
 */
export function createApp() {
  const app = express();

  const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

  app.use(cors({ origin: frontendOrigin }));
  app.use(express.json());

  app.use("/api/health", healthRouter);
  app.use("/api/recommend", recommendRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
