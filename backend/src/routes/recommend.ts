import { Router } from "express";
import { askGemini } from "../services/gemini.js";
import "dotenv/config";

type Member = { text: string };
type RecommendBody = {
  location: { lat: number; lng: number };
  range: 1 | 2 | 3 | 4 | 5;
  members: Member[];
};

const router = Router();

router.post("/", async (req, res, _next) => {
  const obj = req.body as RecommendBody;
  console.dir(obj, { depth: null });

  const userText = obj.members
    .map((member, index) => `${index + 1}人目: ${member.text}`)
    .join("\n\n");

  const geminiReply1 = await askGemini(
    userText +
      "\n\nというリクエストが来ています。" +
      "この要望をまとめてホットペッパーのAPIに投げたいです。\n" +
      "以下の形式に従ってURLのパラメータ部分のみを出力してください。\n" +
      "省略するパラメータについては出力しないでください。完全にパラメータがなくなった場合は&keyword=とだけ出力してください。\n" +
      "余計な日本語は出力しないでください。\n" +
      "&keyword=他のパラメータに入れられない要件全般(なんでも良いみたいなのは入れないこと、省略可)" +
      "&genre=居酒屋ならG001, 和食ならG004, 洋食ならG005, イタリアンやフレンチならG006, 中華ならG007, 該当しないなら省略、複数欲しいならIDでなく単語でkeywordに" +
      "&free_drink=飲み放題が必要なら1、不要なら省略" +
      "&free_food=食べ放題が必要なら1、不要なら省略" +
      "&lunch=ランチ指定あるいは今が昼で時間指定なしなら1、不要なら省略",
  );
  // こっちで入れるのはkey, range(frontで取得), 緯度経度(フロントで取得), count(10とか), order(4)
  const hotpepperApiKey = process.env.HOTPEPPER_API_KEY;
  const hotpepperURL =
    "http://webservice.recruit.co.jp/hotpepper/gourmet/v1/" +
    "?key=" +
    hotpepperApiKey +
    "&format=json" +
    "&range=" +
    obj.range +
    "&lat=" +
    obj.location.lat +
    "&lng=" +
    obj.location.lng +
    "&count=10" +
    "&order=4" +
    geminiReply1;
  console.log(hotpepperURL);
  const hotpepperResponse = await fetch(hotpepperURL);
  const hotpepperReply = await hotpepperResponse.json();
  console.dir(hotpepperReply, { depth: null });

  if (hotpepperReply.results.results_available === 0) {
    const noResult = {
      conditions: {
        budgetLevel: "any",
        excludedGenres: [],
        preferredGenres: [],
        preferredAtmosphere: [],
        maxWalkingMinutes: 0,
      },
      shops: [
        {
          id: "0",
          name: "条件に合致する店が見つかりませんでした",
          genre: "X",
          budget: "X",
          access: "X",
          reason: "条件が厳しすぎるかもしれません。",
          distanceMeters: 0,
        },
      ],
    };
    // {id: "店1ID", name: "店1名前", genre: "店1ジャンル", budget: "店1予算", access: "店1予算", reason: "あなたが店1を選んだ理由(50文字程度)", distanceMeters: number /* 店1の現在地からの距離(メートル) */ } ]
    res.status(200).send(noResult);
    return;
  }

  const geminiReply2 = await askGemini(
    userText +
      "というリクエストに対してホットペッパーのAPIを叩いたところ、\n" +
      JSON.stringify({ value: hotpepperReply, replacer: null, space: 2 }) +
      "\nという結果が帰ってきました。" +
      "ユーザーのリクエストをまとめることと、リクエストに適応する店をオススメ順に3つピックすることが要件です。\n" +
      "これらのうちユーザーのリクエストに適応すると思うものをオススメ順に出力してください。\n" +
      "なお、現在地はlat: " +
      obj.location.lat +
      ", lng: " +
      obj.location.lng +
      "です。\n" +
      "出力は以下の形式でjsonにしてください。コードブロックなどにも入れずにテキストのみを出力してください。\n" +
      '{ summary: "店全体の選定理由(100文字程度)", areaLabel: "指定された場所が大体どんなエリアか(渋谷周辺など、latとlngから推定してください)", conditions: {budgetLevel: "low, medium, high, anyのいずれか", excludedGenres: ["除外するジャンル1", "除外するジャンル2(個数は任せます)"], preferredGenres: ["選択したいジャンル1", "選択したいジャンル2(個数は任せます)"], preferredAtmosphere: ["雰囲気1", "雰囲気2(個数は任せます)"], maxWalkingMinutes: number | null}, shops:[{id: "店1ID", name: "店1名前", genre: "店1ジャンル", budget: "店1予算", access: "店1予算", reason: "あなたが店1を選んだ理由(50文字程度)", distanceMeters: number /* 店1の現在地からの距離(メートル) */, matchScore: number /*あなたが算出した店1のマッチ度(0~100)*/, iconType: "bowl, coffee, utensilsのいずれか" ] }',
  );
  console.log(geminiReply2);

  if (!geminiReply2) {
    res.status(500).json({
      error: "Internal Server Error",
      message: "Geminiから推薦結果を取得できませんでした",
    });
    return;
  }

  const result = JSON.parse(geminiReply2);
  // console.log("AI says" + geminiReply1);
  res.status(200).send(result);
});

export default router;

/*
 * conditions
 * conditions: {
 *   budgetLevel: "low" | "medium" | "high" | "any",
 *   excludedGenres: string[],
 *   preferredGenres: string[],
 *   preferredAtmosphere: string[],
 *   maxWalkingMinutes: number | null,
 * }
 *
 * @typedef {Object} Shop
 * @property {string} id
 * @property {string} name
 * @property {string} genre
 * @property {string} budget
 * @property {string} access
 * @property {string} reason
 * @property {number} distanceMeters
 */
