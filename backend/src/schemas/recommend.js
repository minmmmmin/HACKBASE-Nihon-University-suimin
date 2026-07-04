import { z } from "zod";

/**
 * 店舗推薦APIのリクエストボディを検証するZodスキーマ。
 *
 * @typedef {Object} RecommendRequest
 * @property {{ lat: number, lng: number }} location
 * @property {{ text: string }[]} members
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
