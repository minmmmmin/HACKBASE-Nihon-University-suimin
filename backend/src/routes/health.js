import { Router } from "express";

export const healthRouter = Router();

/**
 * ヘルスチェック。常に200と { status: "ok" } を返す。
 */
healthRouter.get("/", (_req, res) => {
  res.status(200).json({ status: "ok" });
});
