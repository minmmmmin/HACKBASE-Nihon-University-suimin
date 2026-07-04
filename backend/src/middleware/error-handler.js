/**
 * アプリケーションで意図的に発生させるHTTPエラー。
 * ステータスコードとレスポンスボディを保持する。
 */
export class ApiError extends Error {
  /**
   * @param {number} status
   * @param {Record<string, unknown>} body
   */
  constructor(status, body) {
    super(typeof body?.error === "string" ? body.error : "API Error");
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

/**
 * 存在しないルートへのアクセスを処理する404ハンドラー。
 *
 * @param {import("express").Request} _req
 * @param {import("express").Response} res
 */
export function notFoundHandler(_req, res) {
  res.status(404).json({ error: "Not Found" });
}

/**
 * 共通エラーハンドラー。
 * ApiErrorはそのままレスポンス化し、それ以外は500として扱う。
 * 本番環境では内部情報（スタックトレース等）を漏らさない。
 *
 * @param {unknown} err
 * @param {import("express").Request} _req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} _next
 */
export function errorHandler(err, _req, res, _next) {
  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  if (err instanceof ApiError) {
    res.status(err.status).json(err.body);
    return;
  }

  res.status(500).json({ error: "Internal Server Error" });
}
