import { Router } from "express";

import { fetchAreas } from "../services/areas.js";

const router = Router();

/**
 * GET /api/areas
 * エリア選択UI用の大エリア・中エリア一覧を返す。
 */
router.get("/", async (_req, res, next) => {
  try {
    res.json(await fetchAreas());
  } catch (err) {
    next(err);
  }
});

export default router;
