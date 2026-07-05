import { Router } from "express";

import { LARGE_AREAS, MIDDLE_AREAS } from "../data/areas.js";

const router = Router();

/**
 * GET /api/areas
 * エリア選択UI用の大エリア・中エリア一覧を返す。
 * 現状は静的マスタ。将来はホットペッパーのエリアマスタAPIへ差し替える。
 */
router.get("/", (_req, res) => {
  res.json({ largeAreas: LARGE_AREAS, middleAreas: MIDDLE_AREAS });
});

export default router;
