import type { RecommendRequest } from "../schemas/recommend.js";
import type { GroupPreference } from "./gemini.js";

/**
 * 店舗推薦1件。
 */
export interface ShopRecommendation {
  id: string;
  name: string;
  genre: string;
  budget: string;
  access: string;
  reason: string;
  /** 現在地からのおおよその距離（メートル）。 */
  distanceMeters: number;
  matchScore: number;
  iconType: "bowl" | "coffee" | "utensils";
  url?: string;
}

interface HotPepperShop {
  id: string;
  name: string;
  genre?: { name?: string; catch?: string };
  budget?: { name?: string; average?: string };
  access?: string;
  catch?: string;
  lat?: number;
  lng?: number;
  urls?: { pc?: string };
}

interface ScoredShop {
  shop: ShopRecommendation;
  score: number;
}

/**
 * ホットペッパーグルメAPIから店舗候補を取得する。
 */
export async function searchShops(
  request: RecommendRequest,
  preferences: GroupPreference,
): Promise<ShopRecommendation[]> {
  const apiKey = process.env.HOTPEPPER_API_KEY;
  if (!apiKey) {
    throw new Error("HOTPEPPER_API_KEY is required.");
  }

  return searchShopsWithHotPepper(request, preferences, apiKey);
}

async function searchShopsWithHotPepper(
  request: RecommendRequest,
  preferences: GroupPreference,
  apiKey: string,
): Promise<ShopRecommendation[]> {
  const url = new URL("https://webservice.recruit.co.jp/hotpepper/gourmet/v1/");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("format", "json");
  url.searchParams.set("count", "30");
  url.searchParams.set("order", "4");

  if (request.location) {
    url.searchParams.set("lat", String(request.location.lat));
    url.searchParams.set("lng", String(request.location.lng));
    url.searchParams.set("range", String(request.range));
  } else if (request.areaCode) {
    const areaParam =
      request.areaLevel === "large" ? "large_area" : "middle_area";
    url.searchParams.set(areaParam, request.areaCode);
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HotPepper API error: ${response.status}`);
  }

  const data = await response.json();
  const rawShops = data?.results?.shop;
  const shops = Array.isArray(rawShops) ? rawShops : [];

  return shops
    .map((shop: HotPepperShop) =>
      toScoredRecommendation(shop, request, preferences),
    )
    .filter((item: ScoredShop | null): item is ScoredShop => item !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ shop }) => shop);
}

function toScoredRecommendation(
  shop: HotPepperShop,
  request: RecommendRequest,
  preferences: GroupPreference,
): ScoredShop | null {
  if (!shop.id || !shop.name) {
    return null;
  }

  const genre = shop.genre?.name ?? "飲食店";
  if (isExcludedGenre(genre, preferences.excludedGenres)) {
    return null;
  }

  const distanceMeters =
    request.location &&
    typeof shop.lat === "number" &&
    typeof shop.lng === "number"
      ? calculateDistanceMeters(request.location, {
          lat: shop.lat,
          lng: shop.lng,
        })
      : 0;
  const budget = shop.budget?.average ?? shop.budget?.name ?? "予算情報なし";
  const score = scoreShop(
    {
      genre,
      name: shop.name,
      catchText: shop.catch ?? shop.genre?.catch ?? "",
      access: shop.access ?? "",
      budget,
      distanceMeters,
    },
    preferences,
  );

  return {
    score,
    shop: {
      id: shop.id,
      name: shop.name,
      genre,
      budget,
      access: formatAccess(shop.access, distanceMeters),
      reason: buildReason(shop, preferences),
      distanceMeters,
      matchScore: clamp(Math.round(65 + score * 4), 60, 98),
      iconType: pickIconType(genre),
      url: shop.urls?.pc,
    },
  };
}

function isExcludedGenre(genre: string, excludedGenres: string[]): boolean {
  return excludedGenres.some((excluded) => genre.includes(excluded));
}

function scoreShop(
  shop: {
    genre: string;
    name: string;
    catchText: string;
    access: string;
    budget: string;
    distanceMeters: number;
  },
  preferences: GroupPreference,
): number {
  let score = 0;
  const searchable = `${shop.genre} ${shop.name} ${shop.catchText} ${shop.access} ${shop.budget}`;

  for (const genre of preferences.preferredGenres) {
    if (searchable.includes(genre)) {
      score += 3;
    }
  }
  for (const atmosphere of preferences.preferredAtmosphere) {
    if (searchable.includes(atmosphere)) {
      score += 2;
    }
  }
  if (
    preferences.budgetLevel !== "any" &&
    budgetMatches(shop.budget, preferences.budgetLevel)
  ) {
    score += 2;
  }
  if (preferences.maxWalkingMinutes != null && shop.distanceMeters > 0) {
    const maxMeters = preferences.maxWalkingMinutes * 80;
    if (shop.distanceMeters <= maxMeters) {
      score += 2;
    }
  }
  if (shop.distanceMeters > 0 && shop.distanceMeters <= 500) {
    score += 1;
  }

  return score;
}

function budgetMatches(
  budget: string,
  level: Exclude<GroupPreference["budgetLevel"], "any">,
): boolean {
  const numbers =
    budget
      .match(/\d[\d,]*/g)
      ?.map((value) => Number(value.replace(/,/g, ""))) ?? [];
  const maxBudget = numbers.length > 0 ? Math.max(...numbers) : null;

  if (level === "low") {
    return maxBudget != null
      ? maxBudget <= 3000
      : /1000|2000|安|リーズナブル/.test(budget);
  }
  if (level === "medium") {
    return maxBudget != null
      ? maxBudget > 2000 && maxBudget <= 5000
      : /3000|4000|普通/.test(budget);
  }
  return maxBudget != null ? maxBudget >= 5000 : /5000|高級|贅沢/.test(budget);
}

function formatAccess(
  access: string | undefined,
  distanceMeters: number,
): string {
  if (distanceMeters > 0) {
    return `${access || "アクセス情報なし"}（直線約${distanceMeters}m）`;
  }
  return access || "アクセス情報なし";
}

function buildReason(
  shop: HotPepperShop,
  preferences: GroupPreference,
): string {
  const genre = shop.genre?.name ?? "飲食店";
  const catchText = shop.catch ?? shop.genre?.catch;
  const atmosphere =
    preferences.preferredAtmosphere.length > 0
      ? `${preferences.preferredAtmosphere.join("・")}の希望`
      : "みんなの希望";
  const base = catchText ? `${catchText} ` : "";
  return `${base}${genre}として${atmosphere}に合いやすい候補です。`;
}

function pickIconType(genre: string): ShopRecommendation["iconType"] {
  if (/ラーメン|そば|うどん|韓国|中華/.test(genre)) {
    return "bowl";
  }
  if (/カフェ|スイーツ|バー/.test(genre)) {
    return "coffee";
  }
  return "utensils";
}

function calculateDistanceMeters(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
): number {
  const earthRadiusMeters = 6371000;
  const fromLat = toRadians(from.lat);
  const toLat = toRadians(to.lat);
  const deltaLat = toRadians(to.lat - from.lat);
  const deltaLng = toRadians(to.lng - from.lng);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(fromLat) * Math.cos(toLat) * Math.sin(deltaLng / 2) ** 2;
  return Math.round(
    earthRadiusMeters * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)),
  );
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
