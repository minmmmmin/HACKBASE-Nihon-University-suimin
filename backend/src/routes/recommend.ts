import { Router } from "express";

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    const obj = req.body;

    // 本来は service を呼ぶ
    const reply = `こんにちは！「${obj}」を受け取りました。`;

    res.json({ message: reply });
  } catch (err) {
    next(err);
  }
});

export default router;