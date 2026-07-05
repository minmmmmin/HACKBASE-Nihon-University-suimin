import type { RecommendRequest } from "../schemas/recommend.js";

/**
 * AIが自由文から整理した検索条件。
 */
export interface GroupPreference {
  budgetLevel: "low" | "medium" | "high" | "any";
  excludedGenres: string[];
  preferredGenres: string[];
  preferredAtmosphere: string[];
  maxWalkingMinutes: number | null;
  summary: string;
}

/**
 * 複数人の自由文を飲食店検索用の条件へ構造化する。
 *
 * Gemini API で毎回生成し、自由文を構造化する。
 */
export async function parseGroupPreferences(
  request: RecommendRequest,
): Promise<GroupPreference> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is required.");
  }

  return parseGroupPreferencesWithGemini(request, apiKey);
}

async function parseGroupPreferencesWithGemini(
  request: RecommendRequest,
  apiKey: string,
): Promise<GroupPreference> {
  const model = process.env.GEMINI_MODEL ?? "gemini-3.5-flash";
  const url = new URL(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
  );
  url.searchParams.set("key", apiKey);

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: buildPrompt(request),
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            budgetLevel: {
              type: "string",
              enum: ["low", "medium", "high", "any"],
            },
            excludedGenres: {
              type: "array",
              items: { type: "string" },
            },
            preferredGenres: {
              type: "array",
              items: { type: "string" },
            },
            preferredAtmosphere: {
              type: "array",
              items: { type: "string" },
            },
            maxWalkingMinutes: {
              anyOf: [{ type: "integer" }, { type: "null" }],
            },
            summary: { type: "string" },
          },
          required: [
            "budgetLevel",
            "excludedGenres",
            "preferredGenres",
            "preferredAtmosphere",
            "maxWalkingMinutes",
            "summary",
          ],
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string") {
    throw new Error("Gemini API returned no text candidate.");
  }

  return normalizePreference(JSON.parse(text));
}

function buildPrompt(request: RecommendRequest): string {
  const members = request.members
    .map((member, index) => `${index + 1}人目: ${member.text}`)
    .join("\n");

  return [
    "あなたは複数人の食事希望を、飲食店検索に使える条件へ整理するアシスタントです。",
    "回答は指定されたJSONスキーマのみで返してください。",
    "budgetLevelは low=安め, medium=普通, high=高め, any=指定なし です。",
    "excludedGenresとpreferredGenresは日本語の短いジャンル名にしてください。",
    "preferredAtmosphereは「静か」「賑やか」「個室」「駅近」などの短いタグにしてください。",
    "maxWalkingMinutesは徒歩希望が読み取れる場合だけ整数、なければnullにしてください。",
    "summaryは推薦結果画面に出す、80文字程度の日本語の総評にしてください。",
    "",
    members,
  ].join("\n");
}

function normalizePreference(value: unknown): GroupPreference {
  const raw = value as Partial<GroupPreference>;
  const budgetLevel =
    raw.budgetLevel === "low" ||
    raw.budgetLevel === "medium" ||
    raw.budgetLevel === "high" ||
    raw.budgetLevel === "any"
      ? raw.budgetLevel
      : "any";

  return {
    budgetLevel,
    excludedGenres: normalizeStringArray(raw.excludedGenres),
    preferredGenres: normalizeStringArray(raw.preferredGenres),
    preferredAtmosphere: normalizeStringArray(raw.preferredAtmosphere),
    maxWalkingMinutes:
      typeof raw.maxWalkingMinutes === "number" ? raw.maxWalkingMinutes : null,
    summary:
      typeof raw.summary === "string" && raw.summary.trim().length > 0
        ? raw.summary.trim()
        : "みんなの希望を整理して、条件に合いそうなお店をおすすめ順に並べました。",
  };
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}
