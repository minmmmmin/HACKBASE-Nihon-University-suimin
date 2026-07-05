import { Router } from "express";
import { askGemini } from "../services/gemini.js"

const router = Router();

router.post("/", async (req, res, _next) => {
  
  const obj = req.body;

  const reply = await askGemini(obj.members[0].text);

  const result = {
    conditions: {
      budgetLevel: "any",
      excludedGenres: ["居酒屋"],
      preferredGenres: ["イタリアン"],
      preferredAtmosphere: ["静か"],
      maxWalkingMinutes: 10
    },
    shops: [
      {
        id: "shop_001",
        name: "イタリアンレストラン英",
        budget: "~1000円",
        access: "新宿駅から徒歩5分",
        reason: reply,
        distanceMeters: 420,
        imageUrl: "https://example.com/shop.jpg"
      }
    ]
  };
  console.log("AI says" + reply);
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
