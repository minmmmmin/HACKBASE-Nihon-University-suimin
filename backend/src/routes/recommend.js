import { Router } from "express";
import { ApiError } from "../middleware/error-handler.js";
import { recommendRequestSchema } from "../schemas/recommend.js";

export const recommendRouter = Router();

/**
 * 店舗推薦API。
 * リクエストをZodで検証し、失敗時は400を返す。
 * 検証成功後は、Gemini / HotPepper 未接続のため現時点では501を返す。
 */
recommendRouter.post("/", (req, _res) => {
  const result = recommendRequestSchema.safeParse(req.body);

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));

    throw new ApiError(400, {
      error: "Validation Error",
      details,
    });
  }

  // TODO: parseGroupPreferences() と searchShops() を接続して推薦結果を返す。
  throw new ApiError(501, {
    error: "Not Implemented",
    message: "店舗推薦機能はまだ実装されていません",
  });
});
