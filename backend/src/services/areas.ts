export interface LargeArea {
  code: string;
  name: string;
}

export interface MiddleArea {
  code: string;
  name: string;
  /** 所属する大エリアのコード。 */
  largeAreaCode: string;
}

interface HotPepperLargeArea {
  code?: string;
  name?: string;
}

interface HotPepperMiddleArea {
  code?: string;
  name?: string;
  large_area?: {
    code?: string;
    name?: string;
  };
}

interface HotPepperMasterResponse {
  results?: {
    large_area?: HotPepperLargeArea[];
    middle_area?: HotPepperMiddleArea[];
  };
}

/**
 * HotPepper のエリアマスタAPIから大エリア・中エリアを取得する。
 */
export async function fetchAreas(): Promise<{
  largeAreas: LargeArea[];
  middleAreas: MiddleArea[];
}> {
  const apiKey = process.env.HOTPEPPER_API_KEY;
  if (!apiKey) {
    throw new Error("HOTPEPPER_API_KEY is required.");
  }

  const [largeAreas, middleAreas] = await Promise.all([
    fetchLargeAreas(apiKey),
    fetchMiddleAreas(apiKey),
  ]);

  return { largeAreas, middleAreas };
}

async function fetchLargeAreas(apiKey: string): Promise<LargeArea[]> {
  const data = await fetchHotPepperMaster("large_area", apiKey);
  const areas = data?.results?.large_area;
  if (!Array.isArray(areas)) {
    return [];
  }

  return areas
    .map((area: HotPepperLargeArea) => ({
      code: area.code,
      name: area.name,
    }))
    .filter(isLargeArea);
}

async function fetchMiddleAreas(apiKey: string): Promise<MiddleArea[]> {
  const data = await fetchHotPepperMaster("middle_area", apiKey);
  const areas = data?.results?.middle_area;
  if (!Array.isArray(areas)) {
    return [];
  }

  return areas
    .map((area: HotPepperMiddleArea) => ({
      code: area.code,
      name: area.name,
      largeAreaCode: area.large_area?.code,
    }))
    .filter(isMiddleArea);
}

async function fetchHotPepperMaster(
  endpoint: "large_area" | "middle_area",
  apiKey: string,
): Promise<HotPepperMasterResponse> {
  const url = new URL(
    `https://webservice.recruit.co.jp/hotpepper/${endpoint}/v1/`,
  );
  url.searchParams.set("key", apiKey);
  url.searchParams.set("format", "json");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HotPepper ${endpoint} API error: ${response.status}`);
  }

  return response.json();
}

function isLargeArea(area: {
  code?: string;
  name?: string;
}): area is LargeArea {
  return typeof area.code === "string" && typeof area.name === "string";
}

function isMiddleArea(area: {
  code?: string;
  name?: string;
  largeAreaCode?: string;
}): area is MiddleArea {
  return (
    typeof area.code === "string" &&
    typeof area.name === "string" &&
    typeof area.largeAreaCode === "string"
  );
}
