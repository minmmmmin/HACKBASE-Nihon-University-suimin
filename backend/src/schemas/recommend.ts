import { z } from "zod";

/**
 * 店舗推薦APIのリクエストボディを検証するZodスキーマ。
 *
 * 位置の指定方法は2通りのどちらか：
 *   - 現在地モード: location(lat/lng) + range
 *   - エリアモード: areaCode（大エリア/中エリアコード）(+ areaName は表示用の任意)
 */

/** 位置情報（現在地モード）。 */
export const locationSchema = z.object({
  lat: z
    .number({ invalid_type_error: "緯度は数値で入力してください" })
    .min(-90, "緯度は-90以上で入力してください")
    .max(90, "緯度は90以下で入力してください"),
  lng: z
    .number({ invalid_type_error: "経度は数値で入力してください" })
    .min(-180, "経度は-180以上で入力してください")
    .max(180, "経度は180以下で入力してください"),
});

/** 検索範囲コード（1=300m,2=500m,3=1000m,4=2000m,5=3000m）。未指定時は3。 */
export const rangeSchema = z
  .number({ invalid_type_error: "検索範囲は数値で入力してください" })
  .int("検索範囲は整数で入力してください")
  .min(1, "検索範囲は1〜5で入力してください")
  .max(5, "検索範囲は1〜5で入力してください")
  .default(3);

/** エリアコード（大エリア/中エリア）。表示名は任意で受け取る。 */
export const areaCodeSchema = z
  .string({ invalid_type_error: "エリアコードは文字列で送信してください" })
  .trim()
  .min(1, "エリアコードが空です")
  .max(20, "エリアコードが不正です");

export const areaLevelSchema = z.enum(["large", "middle"]).default("middle");

export const areaNameSchema = z
  .string({ invalid_type_error: "エリア名は文字列で送信してください" })
  .trim()
  .max(50, "エリア名が長すぎます");

export const memberSchema = z.object({
  text: z
    .string({ invalid_type_error: "入力は文字列で送信してください" })
    .trim()
    .min(1, "1文字以上入力してください")
    .max(500, "500文字以下で入力してください"),
});

/** 現在地・エリアのどちらか一方が指定されているかを検証する共通ルール。 */
export function hasLocationOrArea(data: {
  location?: unknown;
  areaCode?: unknown;
}): boolean {
  return Boolean(data.location) || Boolean(data.areaCode);
}

export const recommendRequestSchema = z
  .object({
    location: locationSchema.optional(),
    range: rangeSchema,
    areaCode: areaCodeSchema.optional(),
    areaLevel: areaLevelSchema.optional(),
    areaName: areaNameSchema.optional(),
    members: z.array(memberSchema).min(1, "少なくとも1人分の入力が必要です"),
  })
  .refine(hasLocationOrArea, {
    message: "現在地またはエリアのどちらかを指定してください",
    path: ["location"],
  });

/** 検証・パース済みのリクエスト型。 */
export type RecommendRequest = z.infer<typeof recommendRequestSchema>;
