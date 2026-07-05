import { Router } from "express";
import { askGemini } from "../services/gemini.js"

const router = Router();

router.post("/", async (req, res, _next) => {
  
  const obj = req.body;

  const reply = askGemini(obj.members[0].text);

  res.json({ message: reply });
  
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
