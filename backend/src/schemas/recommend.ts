import { z } from "zod";

/**
 * 店舗推薦APIのリクエストボディを検証するZodスキーマ。
 */
export const recommendRequestSchema = z.object({
  location: z.object(
    {
      lat: z
        .number({ invalid_type_error: "緯度は数値で入力してください" })
        .min(-90, "緯度は-90以上で入力してください")
        .max(90, "緯度は90以下で入力してください"),
      lng: z
        .number({ invalid_type_error: "経度は数値で入力してください" })
        .min(-180, "経度は-180以上で入力してください")
        .max(180, "経度は180以下で入力してください"),
    },
    { required_error: "位置情報は必須です" },
  ),
  // ホットペッパー準拠の検索範囲コード（1=300m,2=500m,3=1000m,4=2000m,5=3000m）。
  // 未指定時は3（1km）を既定とする。
  range: z
    .number({ invalid_type_error: "検索範囲は数値で入力してください" })
    .int("検索範囲は整数で入力してください")
    .min(1, "検索範囲は1〜5で入力してください")
    .max(5, "検索範囲は1〜5で入力してください")
    .default(3),
  members: z
    .array(
      z.object({
        text: z
          .string({ invalid_type_error: "入力は文字列で送信してください" })
          .trim()
          .min(1, "1文字以上入力してください")
          .max(500, "500文字以下で入力してください"),
      }),
    )
    .min(1, "少なくとも1人分の入力が必要です"),
});

/** 検証・パース済みのリクエスト型。 */
export type RecommendRequest = z.infer<typeof recommendRequestSchema>;
