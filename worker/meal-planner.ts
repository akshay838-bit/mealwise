export type MealType = "breakfast" | "lunch" | "dinner";

export interface Meal {
  id: string;
  type: MealType;
  name: string;
  protein: string;
  grain: string;
  vegetables: string[];
  nutrition: number;
  child: number;
  heart: number;
  preference: number;
  practicality: number;
}

export interface RecentMeal {
  mealId: string;
  protein: string;
  grain: string;
  servedOn: string;
}

export interface DailyPlan {
  date: string;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  scores: Record<MealType, number>;
  rationale: string[];
}

export const FAMILY_PROFILE = {
  household: [
    { name: "Adult A", age: 40, diet: "eggetarian", goal: "fitness", note: "sample dietary preference" },
    { name: "Child", age: 8, diet: "vegetarian", goal: "growth, strength and stamina" },
    { name: "Owner", age: 40, diet: "vegetarian", goal: "fitness", note: "sample dietary preference" },
  ],
  allergies: ["fish"],
  dislikes: ["gawar phali"],
  likes: ["paneer"],
  weights: { nutrition: 0.4, variety: 0.3, preference: 0.15, practicality: 0.15 },
} as const;

export const MEALS: Meal[] = [
  { id: "veg-poha-curd", type: "breakfast", name: "वेजिटेबल पोहा और दही", protein: "curd", grain: "poha", vegetables: ["peas", "carrot"], nutrition: 8, child: 8, heart: 9, preference: 7, practicality: 10 },
  { id: "besan-chilla-curd", type: "breakfast", name: "बेसन चिल्ला और दही", protein: "besan", grain: "besan", vegetables: ["onion", "tomato"], nutrition: 9, child: 8, heart: 9, preference: 8, practicality: 9 },
  { id: "moong-chilla-paneer", type: "breakfast", name: "मूंग दाल चिल्ला और हल्की paneer filling", protein: "moong", grain: "moong", vegetables: ["coriander"], nutrition: 10, child: 9, heart: 8, preference: 10, practicality: 7 },
  { id: "idli-sambar", type: "breakfast", name: "इडली और सांभर", protein: "toor", grain: "rice", vegetables: ["mixed vegetables"], nutrition: 9, child: 9, heart: 9, preference: 8, practicality: 7 },
  { id: "veg-upma-curd", type: "breakfast", name: "वेजिटेबल उपमा और दही", protein: "curd", grain: "suji", vegetables: ["peas", "carrot", "beans"], nutrition: 8, child: 8, heart: 8, preference: 7, practicality: 9 },
  { id: "oats-veg-cheela", type: "breakfast", name: "ओट्स वेज चिल्ला और दही", protein: "curd", grain: "oats", vegetables: ["onion", "carrot"], nutrition: 9, child: 7, heart: 10, preference: 6, practicality: 8 },
  { id: "paneer-veg-sandwich", type: "breakfast", name: "paneer वेज sandwich", protein: "paneer", grain: "whole wheat bread", vegetables: ["capsicum", "tomato"], nutrition: 8, child: 10, heart: 7, preference: 10, practicality: 9 },
  { id: "stuffed-paratha-curd", type: "breakfast", name: "मिक्स वेज पराठा और दही", protein: "curd", grain: "wheat", vegetables: ["cauliflower", "carrot"], nutrition: 7, child: 9, heart: 7, preference: 9, practicality: 8 },
  { id: "dalia-milk", type: "breakfast", name: "वेजिटेबल दलिया और दूध", protein: "milk", grain: "dalia", vegetables: ["peas", "carrot"], nutrition: 9, child: 9, heart: 9, preference: 7, practicality: 8 },
  { id: "ragi-dosa-sambar", type: "breakfast", name: "रागी डोसा और सांभर", protein: "toor", grain: "ragi", vegetables: ["mixed vegetables"], nutrition: 10, child: 8, heart: 10, preference: 7, practicality: 6 },

  { id: "rajma-rice-salad", type: "lunch", name: "राजमा, चावल और सलाद", protein: "rajma", grain: "rice", vegetables: ["cucumber", "tomato"], nutrition: 9, child: 9, heart: 9, preference: 9, practicality: 9 },
  { id: "chole-roti-salad", type: "lunch", name: "छोले, रोटी और सलाद", protein: "chana", grain: "wheat", vegetables: ["cucumber", "tomato"], nutrition: 9, child: 8, heart: 9, preference: 9, practicality: 9 },
  { id: "dal-palak-roti", type: "lunch", name: "दाल पालक, रोटी और दही", protein: "moong", grain: "wheat", vegetables: ["spinach"], nutrition: 10, child: 9, heart: 10, preference: 8, practicality: 9 },
  { id: "veg-pulao-raita", type: "lunch", name: "वेजिटेबल पुलाव और रायता", protein: "curd", grain: "rice", vegetables: ["peas", "carrot", "beans"], nutrition: 8, child: 9, heart: 8, preference: 9, practicality: 9 },
  { id: "kadhi-rice-beans", type: "lunch", name: "कढ़ी, चावल और beans की सब्ज़ी", protein: "besan", grain: "rice", vegetables: ["beans"], nutrition: 8, child: 9, heart: 8, preference: 9, practicality: 8 },
  { id: "paneer-capsicum-roti", type: "lunch", name: "हल्का paneer capsicum, रोटी और सलाद", protein: "paneer", grain: "wheat", vegetables: ["capsicum", "tomato"], nutrition: 8, child: 10, heart: 7, preference: 10, practicality: 8 },
  { id: "sambar-rice-beetroot", type: "lunch", name: "सांभर, चावल और beetroot सलाद", protein: "toor", grain: "rice", vegetables: ["mixed vegetables", "beetroot"], nutrition: 10, child: 8, heart: 10, preference: 8, practicality: 8 },
  { id: "kala-chana-roti", type: "lunch", name: "काला चना, रोटी और ककड़ी", protein: "kala chana", grain: "wheat", vegetables: ["cucumber"], nutrition: 10, child: 8, heart: 10, preference: 8, practicality: 9 },
  { id: "masoor-mixed-veg-roti", type: "lunch", name: "मसूर दाल, mixed veg और रोटी", protein: "masoor", grain: "wheat", vegetables: ["cauliflower", "peas", "carrot"], nutrition: 10, child: 9, heart: 10, preference: 8, practicality: 9 },
  { id: "soy-matar-rice", type: "lunch", name: "सोया मटर, चावल और सलाद", protein: "soy", grain: "rice", vegetables: ["peas", "cucumber"], nutrition: 10, child: 9, heart: 9, preference: 8, practicality: 8 },

  { id: "lauki-chana-roti", type: "dinner", name: "लौकी चना दाल और रोटी", protein: "chana dal", grain: "wheat", vegetables: ["bottle gourd"], nutrition: 10, child: 8, heart: 10, preference: 7, practicality: 9 },
  { id: "palak-paneer-roti", type: "dinner", name: "हल्का पालक paneer और रोटी", protein: "paneer", grain: "wheat", vegetables: ["spinach"], nutrition: 9, child: 10, heart: 8, preference: 10, practicality: 8 },
  { id: "tori-moong-roti", type: "dinner", name: "तोरी, मूंग दाल और रोटी", protein: "moong", grain: "wheat", vegetables: ["ridge gourd"], nutrition: 10, child: 8, heart: 10, preference: 7, practicality: 9 },
  { id: "matar-paneer-roti", type: "dinner", name: "मटर paneer और रोटी", protein: "paneer", grain: "wheat", vegetables: ["peas"], nutrition: 8, child: 10, heart: 7, preference: 10, practicality: 9 },
  { id: "moong-khichdi-curd", type: "dinner", name: "मूंग दाल खिचड़ी और दही", protein: "moong", grain: "rice", vegetables: ["peas", "carrot"], nutrition: 9, child: 9, heart: 10, preference: 8, practicality: 10 },
  { id: "bhindi-dal-roti", type: "dinner", name: "भिंडी, अरहर दाल और रोटी", protein: "toor", grain: "wheat", vegetables: ["okra"], nutrition: 9, child: 8, heart: 9, preference: 9, practicality: 9 },
  { id: "aloo-gobhi-masoor", type: "dinner", name: "आलू गोभी, मसूर दाल और रोटी", protein: "masoor", grain: "wheat", vegetables: ["cauliflower"], nutrition: 9, child: 9, heart: 8, preference: 9, practicality: 9 },
  { id: "soy-keema-roti", type: "dinner", name: "सोया कीमा मटर और रोटी", protein: "soy", grain: "wheat", vegetables: ["peas", "tomato"], nutrition: 10, child: 9, heart: 9, preference: 8, practicality: 8 },
  { id: "mixed-veg-dal-roti", type: "dinner", name: "मिक्स वेज, मसूर दाल और रोटी", protein: "masoor", grain: "wheat", vegetables: ["carrot", "beans", "cauliflower"], nutrition: 10, child: 9, heart: 10, preference: 8, practicality: 9 },
  { id: "vegetable-dalia-curd", type: "dinner", name: "वेजिटेबल दलिया और दही", protein: "curd", grain: "dalia", vegetables: ["peas", "carrot", "beans"], nutrition: 9, child: 8, heart: 10, preference: 7, practicality: 9 },
];

export const MEAL_REFERENCE = {"sourceUrl": "embedded sample weekly menu", "sheet": "Sheet1", "readAt": "2026-10-02", "excludeFruits": true, "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], "weeklyMeals": [["Moong-paneer chilla with curd", "Masoor dal, bhindi, roti, curd and cucumber-tomato salad", "Palak paneer, roti and carrot-cucumber salad"], ["Vegetable poha with curd", "Rajma, rice, curd and beetroot-cucumber salad", "Tofu, beans, capsicum and carrot stir-fry with rice"], ["Oats with milk and hung curd", "Arhar dal, beans-carrot sabzi, roti and curd", "Rajma rice with cucumber raita"], ["Idli with vegetable sambar and curd", "Chole, lauki-tomato sabzi, roti and curd", "Moong-masoor dal, tori, roti and curd"], ["Paneer paratha with curd", "Moong dal, cabbage-peas-carrot sabzi, rice and curd", "Paneer tikka, roti and grilled vegetables"], ["Besan-paneer chilla with curd", "Soya, peas and carrot pulao with cucumber raita", "Moong-dal vegetable khichdi, curd and beetroot-carrot-cucumber salad"], ["Dosa with sambar and curd", "Chana dal, methi-aloo, roti and curd", "Dal, roti and mixed vegetables"]], "note": "Main family meals stay vegetarian; the sheet’s egg sides are optional for Adult A only. Sunday dinner uses the sheet’s flexible dal/roti/vegetables guidance. Small variations are allowed."} as const;

const REFERENCE_MEALS: Meal[] = [
{"id": "reference-0-0", "type": "breakfast", "name": "Moong-paneer chilla with curd", "protein": "moong", "grain": "moong", "vegetables": [], "nutrition": 9, "child": 9, "heart": 9, "preference": 9, "practicality": 9},
{"id": "reference-0-1", "type": "lunch", "name": "Masoor dal, bhindi, roti, curd and cucumber-tomato salad", "protein": "masoor", "grain": "wheat", "vegetables": [], "nutrition": 9, "child": 9, "heart": 9, "preference": 9, "practicality": 9},
{"id": "reference-0-2", "type": "dinner", "name": "Palak paneer, roti and carrot-cucumber salad", "protein": "paneer", "grain": "wheat", "vegetables": [], "nutrition": 9, "child": 9, "heart": 9, "preference": 9, "practicality": 9},
{"id": "reference-1-0", "type": "breakfast", "name": "Vegetable poha with curd", "protein": "curd", "grain": "poha", "vegetables": [], "nutrition": 9, "child": 9, "heart": 9, "preference": 9, "practicality": 9},
{"id": "reference-1-1", "type": "lunch", "name": "Rajma, rice, curd and beetroot-cucumber salad", "protein": "rajma", "grain": "rice", "vegetables": [], "nutrition": 9, "child": 9, "heart": 9, "preference": 9, "practicality": 9},
{"id": "reference-1-2", "type": "dinner", "name": "Tofu, beans, capsicum and carrot stir-fry with rice", "protein": "tofu", "grain": "rice", "vegetables": [], "nutrition": 9, "child": 9, "heart": 9, "preference": 9, "practicality": 9},
{"id": "reference-2-0", "type": "breakfast", "name": "Oats with milk and hung curd", "protein": "milk", "grain": "oats", "vegetables": [], "nutrition": 9, "child": 9, "heart": 9, "preference": 9, "practicality": 9},
{"id": "reference-2-1", "type": "lunch", "name": "Arhar dal, beans-carrot sabzi, roti and curd", "protein": "toor", "grain": "wheat", "vegetables": [], "nutrition": 9, "child": 9, "heart": 9, "preference": 9, "practicality": 9},
{"id": "reference-2-2", "type": "dinner", "name": "Rajma rice with cucumber raita", "protein": "rajma", "grain": "rice", "vegetables": [], "nutrition": 9, "child": 9, "heart": 9, "preference": 9, "practicality": 9},
{"id": "reference-3-0", "type": "breakfast", "name": "Idli with vegetable sambar and curd", "protein": "toor", "grain": "rice", "vegetables": [], "nutrition": 9, "child": 9, "heart": 9, "preference": 9, "practicality": 9},
{"id": "reference-3-1", "type": "lunch", "name": "Chole, lauki-tomato sabzi, roti and curd", "protein": "chana", "grain": "wheat", "vegetables": [], "nutrition": 9, "child": 9, "heart": 9, "preference": 9, "practicality": 9},
{"id": "reference-3-2", "type": "dinner", "name": "Moong-masoor dal, tori, roti and curd", "protein": "moong", "grain": "wheat", "vegetables": [], "nutrition": 9, "child": 9, "heart": 9, "preference": 9, "practicality": 9},
{"id": "reference-4-0", "type": "breakfast", "name": "Paneer paratha with curd", "protein": "paneer", "grain": "wheat", "vegetables": [], "nutrition": 9, "child": 9, "heart": 9, "preference": 9, "practicality": 9},
{"id": "reference-4-1", "type": "lunch", "name": "Moong dal, cabbage-peas-carrot sabzi, rice and curd", "protein": "moong", "grain": "rice", "vegetables": [], "nutrition": 9, "child": 9, "heart": 9, "preference": 9, "practicality": 9},
{"id": "reference-4-2", "type": "dinner", "name": "Paneer tikka, roti and grilled vegetables", "protein": "paneer", "grain": "wheat", "vegetables": [], "nutrition": 9, "child": 9, "heart": 9, "preference": 9, "practicality": 9},
{"id": "reference-5-0", "type": "breakfast", "name": "Besan-paneer chilla with curd", "protein": "besan", "grain": "besan", "vegetables": [], "nutrition": 9, "child": 9, "heart": 9, "preference": 9, "practicality": 9},
{"id": "reference-5-1", "type": "lunch", "name": "Soya, peas and carrot pulao with cucumber raita", "protein": "soy", "grain": "rice", "vegetables": [], "nutrition": 9, "child": 9, "heart": 9, "preference": 9, "practicality": 9},
{"id": "reference-5-2", "type": "dinner", "name": "Moong-dal vegetable khichdi, curd and beetroot-carrot-cucumber salad", "protein": "moong", "grain": "rice", "vegetables": [], "nutrition": 9, "child": 9, "heart": 9, "preference": 9, "practicality": 9},
{"id": "reference-6-0", "type": "breakfast", "name": "Dosa with sambar and curd", "protein": "toor", "grain": "rice", "vegetables": [], "nutrition": 9, "child": 9, "heart": 9, "preference": 9, "practicality": 9},
{"id": "reference-6-1", "type": "lunch", "name": "Chana dal, methi-aloo, roti and curd", "protein": "chana dal", "grain": "wheat", "vegetables": [], "nutrition": 9, "child": 9, "heart": 9, "preference": 9, "practicality": 9},
{"id": "reference-6-2", "type": "dinner", "name": "Dal, roti and mixed vegetables", "protein": "masoor", "grain": "wheat", "vegetables": [], "nutrition": 9, "child": 9, "heart": 9, "preference": 9, "practicality": 9},
];
MEALS.push(...REFERENCE_MEALS);

const PLAN_APPROVAL_REPLIES = new Set([
  "ठीक है",
  "ठीक",
  "मंजूर",
  "theek hai",
  "thik hai",
  "theek",
  "thik",
  "haan theek hai",
  "han theek hai",
  "ok",
  "okay",
  "ok hai",
  "approved",
  "approve",
  "looks good",
  "fine",
]);

export function isPlanApprovalReply(input: string): boolean {
  const normalized = input
    .toLocaleLowerCase("hi-IN")
    .replace(/[।,.!?;:()\[\]{}"']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return PLAN_APPROVAL_REPLIES.has(normalized);
}

function daysBetween(later: string, earlier: string): number {
  return Math.floor((Date.parse(`${later}T00:00:00Z`) - Date.parse(`${earlier}T00:00:00Z`)) / 86_400_000);
}

function varietyScore(meal: Meal, date: string, recent: RecentMeal[]): number {
  let score = 10;
  for (const item of recent) {
    const days = daysBetween(date, item.servedOn);
    if (days < 0) continue;
    if (item.mealId === meal.id) score -= days <= 7 ? 10 : days <= 14 ? 6 : 2;
    if (item.protein === meal.protein) score -= days <= 2 ? 4 : days <= 4 ? 2 : 0;
    if (item.grain === meal.grain) score -= days <= 1 ? 2 : 0;
  }
  return Math.max(0, Math.min(10, score));
}

export function scoreMeal(meal: Meal, date: string, recent: RecentMeal[]): number {
  const nutrition = (meal.nutrition * 0.45) + (meal.child * 0.25) + (meal.heart * 0.3);
  const variety = varietyScore(meal, date, recent);
  const { weights } = FAMILY_PROFILE;
  return Number((
    nutrition * weights.nutrition
    + variety * weights.variety
    + meal.preference * weights.preference
    + meal.practicality * weights.practicality
  ).toFixed(3));
}

function selectMeal(type: MealType, date: string, recent: RecentMeal[], selectedToday: Meal[]): { meal: Meal; score: number } {
  const day=(new Date(`${date}T00:00:00Z`).getUTCDay()+6)%7;
  const preferred=`reference-${day}-${["breakfast","lunch","dinner"].indexOf(type)}`;
  const ranked = MEALS
    .filter((meal) => meal.type === type)
    .filter((meal) => !selectedToday.some((selected) => selected.protein === meal.protein))
    .map((meal) => ({ meal, score: scoreMeal(meal, date, recent) + (meal.id===preferred && !recent.some(r=>r.mealId===meal.id && daysBetween(date,r.servedOn)<=1) ? 10 : 0) }))
    .sort((a, b) => b.score - a.score || a.meal.id.localeCompare(b.meal.id));
  return ranked[0];
}

export function generateDailyPlan(date: string, recent: RecentMeal[] = []): DailyPlan {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) {
    throw new Error("Plan date must use YYYY-MM-DD");
  }
  const breakfast = selectMeal("breakfast", date, recent, []);
  const lunch = selectMeal("lunch", date, recent, [breakfast.meal]);
  const dinner = selectMeal("dinner", date, recent, [breakfast.meal, lunch.meal]);
  return {
    date,
    breakfast: breakfast.meal,
    lunch: lunch.meal,
    dinner: dinner.meal,
    scores: { breakfast: breakfast.score, lunch: lunch.score, dinner: dinner.score },
    rationale: [
      "Meals follow the supplied Diet Plan, with fruits excluded and small variations for variety.",
      "Adults के लिए fibre और heart-friendly options तथा Child के लिए protein और growth support को प्राथमिकता दी गई है।",
      "पिछले meals के dish, protein और grain repetition पर variety penalty लगाई गई है।",
    ],
  };
}
