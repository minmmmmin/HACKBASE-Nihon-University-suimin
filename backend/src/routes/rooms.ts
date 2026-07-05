import { Router } from "express";
import { createRoomSchema, joinRoomSchema } from "../schemas/rooms.js";
import { parseGroupPreferences } from "../services/gemini.js";
import { searchShops } from "../services/hotpepper.js";
import {
  addMember,
  createRoom,
  getRoom,
  type Room,
  setRoomResult,
} from "../store/rooms.js";
import { resolveResultMeta } from "./recommend.js";

const router = Router();

/** Zodのエラーを 400 レスポンス形式へ変換する。 */
function validationDetails(error: import("zod").ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}

/**
 * 部屋の公開ビュー。
 * 参加者の希望テキストは含めず、名前と人数だけを返す（プライバシー保護）。
 */
function toPublicRoom(room: Room) {
  return {
    id: room.id,
    status: room.status,
    range: room.range,
    // 現在地モードか、選択されたエリア名か（表示用）。
    areaLabel: room.areaName ?? (room.location ? "現在地周辺" : null),
    memberCount: room.members.length,
    members: room.members.map((m) => ({ id: m.id, name: m.name })),
    hasResult: room.result !== null,
  };
}

/**
 * POST /api/rooms
 * 幹事が位置・範囲を指定して部屋を作成する。
 * hostToken は作成者にだけ返し、以後の検索実行の認可に使う。
 */
router.post("/", (req, res) => {
  const result = createRoomSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      error: "Validation Error",
      details: validationDetails(result.error),
    });
    return;
  }

  const room = createRoom(result.data);
  res.status(201).json({
    roomId: room.id,
    hostToken: room.hostToken,
    range: room.range,
  });
});

/**
 * GET /api/rooms/:id
 * 部屋の状態（人数・参加者名・検索済みか）を返す。希望テキストは返さない。
 * 参加画面・幹事の待機画面のポーリングで使う。
 */
router.get("/:id", (req, res) => {
  const room = getRoom(req.params.id);
  if (!room) {
    res
      .status(404)
      .json({ error: "Not Found", message: "部屋が見つかりません" });
    return;
  }
  res.json(toPublicRoom(room));
});

/**
 * POST /api/rooms/:id/members
 * 参加者が自分の希望を投稿する。検索実行後（done）は受け付けない。
 */
router.post("/:id/members", (req, res) => {
  const room = getRoom(req.params.id);
  if (!room) {
    res
      .status(404)
      .json({ error: "Not Found", message: "部屋が見つかりません" });
    return;
  }
  if (room.status === "done") {
    res.status(409).json({
      error: "Conflict",
      message: "この部屋はすでに検索が実行されています",
    });
    return;
  }

  const result = joinRoomSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      error: "Validation Error",
      details: validationDetails(result.error),
    });
    return;
  }

  const name =
    result.data.name && result.data.name.length > 0
      ? result.data.name
      : `ゲスト${room.members.length + 1}`;
  const member = addMember(room, { name, text: result.data.text });
  res.status(201).json({ memberId: member.id, name });
});

/**
 * POST /api/rooms/:id/recommend
 * 幹事が締めて店舗検索を実行する。x-host-token による認可が必要。
 * 既存の parseGroupPreferences / searchShops をそのまま利用する。
 */
router.post("/:id/recommend", async (req, res, next) => {
  const room = getRoom(req.params.id);
  if (!room) {
    res
      .status(404)
      .json({ error: "Not Found", message: "部屋が見つかりません" });
    return;
  }

  const token = req.header("x-host-token");
  if (token !== room.hostToken) {
    res
      .status(403)
      .json({ error: "Forbidden", message: "検索を実行する権限がありません" });
    return;
  }

  if (room.members.length === 0) {
    res.status(400).json({
      error: "Bad Request",
      message: "参加者が1人もいません",
    });
    return;
  }

  // 結果が既にあれば再計算せずに返す（多重押下対策）。
  if (room.result) {
    res.json(room.result);
    return;
  }

  try {
    const request = {
      location: room.location,
      range: room.range,
      areaCode: room.areaCode,
      areaName: room.areaName,
      members: room.members.map((m) => ({ text: m.text })),
    };
    const conditions = await parseGroupPreferences(request);
    const shops = await searchShops(request, conditions);
    const meta = resolveResultMeta(request);
    const result = { conditions, shops, ...meta };
    setRoomResult(room, result);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/rooms/:id/result
 * 参加者が結果をポーリング取得する。
 * まだ検索前なら 202 を返し、完了していれば結果を返す。
 */
router.get("/:id/result", (req, res) => {
  const room = getRoom(req.params.id);
  if (!room) {
    res
      .status(404)
      .json({ error: "Not Found", message: "部屋が見つかりません" });
    return;
  }
  if (!room.result) {
    res.status(202).json({ status: "collecting" });
    return;
  }
  res.json(room.result);
});

export default router;
