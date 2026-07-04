import { Router } from "express";
import { recommendRequestSchema } from "../schemas/recommend.js";
import { parseGroupPreferences } from "../services/gemini.js";
import { searchShops } from "../services/hotpepper.js";

const router = Router();

/**
 * 店舗推薦API。
 * リクエストをZodで検証し、失敗時は400を返す。
 * 検証成功後は、AIで条件を整理（parseGroupPreferences）し、
 * その条件で店舗候補を検索（searchShops）して結果を返す。
 */
router.post("/", async (req, res, next) => {
  const result = recommendRequestSchema.safeParse(req.body);

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
    res.status(400).json({ error: "Validation Error", details });
    return;
  }

  try {
    const conditions = await parseGroupPreferences(result.data);
    const shops = await searchShops(result.data, conditions);
    res.json({ conditions, shops });
  } catch (err) {
    // Gemini / HotPepper 呼び出しの失敗は共通エラーハンドラへ委譲する。
    next(err);
  }
});

export default router;
