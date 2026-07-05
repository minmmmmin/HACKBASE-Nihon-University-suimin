import { Router } from "express";
import { findMiddleArea } from "../data/areas.js";
import { recommendRequestSchema } from "../schemas/recommend.js";
import { parseGroupPreferences } from "../services/gemini.js";
import { searchShops } from "../services/hotpepper.js";

const router = Router();

/**
 * 結果表示用のメタ情報を組み立てる。
 * エリアモードなら中エリア名（範囲は使わないので null）、
 * 現在地モードなら「現在地周辺」＋範囲コードを返す。
 */
export function resolveResultMeta(request: {
  location?: unknown;
  areaCode?: string;
  areaName?: string;
  range: number;
}): { areaLabel: string; range: number | null } {
  if (!request.location && request.areaCode) {
    const label =
      request.areaName ??
      findMiddleArea(request.areaCode)?.name ??
      "指定エリア";
    return { areaLabel: label, range: null };
  }
  return { areaLabel: "現在地周辺", range: request.range };
}

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
    const meta = resolveResultMeta(result.data);
    res.json({ conditions, summary: conditions.summary, shops, ...meta });
  } catch (err) {
    // Gemini / HotPepper 呼び出しの失敗は共通エラーハンドラへ委譲する。
    next(err);
  }
});

export default router;
