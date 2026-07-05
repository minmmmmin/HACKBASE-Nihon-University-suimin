import { randomUUID } from "node:crypto";

import type { GroupPreference } from "../services/gemini.js";
import type { ShopRecommendation } from "../services/hotpepper.js";

/**
 * ルーム機能のメモリ上ストア。
 *
 * DBを使わず、プロセスのメモリに部屋を保持する（ハッカソン向けの割り切り）。
 * サーバ再起動や複数インスタンスでは共有されない点に注意。
 * 一定時間を過ぎた部屋は定期的に破棄する。
 */

/** 参加者1人分。text（自由文の希望）はサーバ内部だけで扱い、外へは返さない。 */
export interface RoomMember {
  id: string;
  name: string;
  text: string;
  joinedAt: number;
}

/** 推薦結果（幹事が検索を実行した後に格納される）。 */
export interface RoomResult {
  conditions: GroupPreference;
  shops: ShopRecommendation[];
  /** 結果表示用のエリア名（現在地モードなら「現在地周辺」）。 */
  areaLabel: string;
  /** 現在地モードの検索範囲コード。エリアモードでは null。 */
  range: number | null;
}

export interface Room {
  id: string;
  hostToken: string;
  /** 現在地モードの座標。エリアモードでは未設定。 */
  location?: { lat: number; lng: number };
  range: number;
  /** エリアモードの大エリア/中エリアコード・表示名。現在地モードでは未設定。 */
  areaCode?: string;
  areaLevel?: "large" | "middle";
  areaName?: string;
  members: RoomMember[];
  /** collecting: 希望を集めている / done: 検索実行済み。 */
  status: "collecting" | "done";
  result: RoomResult | null;
  createdAt: number;
}

/** 部屋の有効期間（これを過ぎたら破棄）。 */
const ROOM_TTL_MS = 2 * 60 * 60 * 1000; // 2時間

/** 合言葉コードに使う文字。紛らわしい文字（0/O/1/I/L）は除外。 */
const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const CODE_LENGTH = 6;

const rooms = new Map<string, Room>();

/** 合言葉コード（部屋ID）を生成する。既存と衝突しないものを返す。 */
function generateRoomId(): string {
  for (let attempt = 0; attempt < 20; attempt++) {
    let code = "";
    for (let i = 0; i < CODE_LENGTH; i++) {
      code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
    }
    if (!rooms.has(code)) {
      return code;
    }
  }
  // 万一衝突が続いた場合はUUIDベースにフォールバック。
  return randomUUID().replace(/-/g, "").slice(0, CODE_LENGTH).toUpperCase();
}

/** 部屋を作成する。 */
export function createRoom(input: {
  location?: { lat: number; lng: number };
  range: number;
  areaCode?: string;
  areaLevel?: "large" | "middle";
  areaName?: string;
}): Room {
  const room: Room = {
    id: generateRoomId(),
    hostToken: randomUUID(),
    location: input.location,
    range: input.range,
    areaCode: input.areaCode,
    areaLevel: input.areaLevel,
    areaName: input.areaName,
    members: [],
    status: "collecting",
    result: null,
    createdAt: Date.now(),
  };
  rooms.set(room.id, room);
  return room;
}

/** 部屋を取得する。期限切れの場合は破棄して undefined を返す。 */
export function getRoom(id: string): Room | undefined {
  const room = rooms.get(id);
  if (!room) {
    return undefined;
  }
  if (Date.now() - room.createdAt > ROOM_TTL_MS) {
    rooms.delete(id);
    return undefined;
  }
  return room;
}

/** 参加者の希望を部屋に追加する。 */
export function addMember(
  room: Room,
  input: { name: string; text: string },
): RoomMember {
  const member: RoomMember = {
    id: randomUUID(),
    name: input.name,
    text: input.text,
    joinedAt: Date.now(),
  };
  room.members.push(member);
  return member;
}

/** 推薦結果を部屋に格納し、状態を done にする。 */
export function setRoomResult(room: Room, result: RoomResult): void {
  room.result = result;
  room.status = "done";
}

// 期限切れの部屋を定期的に掃除する（メモリリーク防止）。
const cleanupTimer = setInterval(
  () => {
    const now = Date.now();
    for (const [id, room] of rooms) {
      if (now - room.createdAt > ROOM_TTL_MS) {
        rooms.delete(id);
      }
    }
  },
  10 * 60 * 1000, // 10分ごと
);
// このタイマーだけでプロセスを生かし続けない。
cleanupTimer.unref?.();
