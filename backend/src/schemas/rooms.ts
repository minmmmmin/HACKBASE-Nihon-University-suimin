import { z } from "zod";

import {
  areaCodeSchema,
  areaNameSchema,
  hasLocationOrArea,
  locationSchema,
  rangeSchema,
} from "./recommend.js";

/**
 * ルーム機能のリクエスト検証スキーマ。
 */

/** POST /api/rooms：幹事が部屋を作成する。位置は現在地 or エリアのどちらか。 */
export const createRoomSchema = z
  .object({
    location: locationSchema.optional(),
    range: rangeSchema,
    areaCode: areaCodeSchema.optional(),
    areaName: areaNameSchema.optional(),
  })
  .refine(hasLocationOrArea, {
    message: "現在地またはエリアのどちらかを指定してください",
    path: ["location"],
  });

/** POST /api/rooms/:id/members：参加者が自分の希望を投稿する。 */
export const joinRoomSchema = z.object({
  // 名前は任意。未入力なら後段で「ゲスト」を割り当てる。
  name: z
    .string({ invalid_type_error: "名前は文字列で送信してください" })
    .trim()
    .max(20, "名前は20文字以下で入力してください")
    .optional(),
  text: z
    .string({ invalid_type_error: "入力は文字列で送信してください" })
    .trim()
    .min(1, "1文字以上入力してください")
    .max(500, "500文字以下で入力してください"),
});

export type CreateRoomRequest = z.infer<typeof createRoomSchema>;
export type JoinRoomRequest = z.infer<typeof joinRoomSchema>;
