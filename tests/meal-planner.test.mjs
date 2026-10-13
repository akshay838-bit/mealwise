import assert from "node:assert/strict";
import test from "node:test";
import { generateDailyPlan, isPlanApprovalReply } from "../worker/meal-planner.ts";

test("creates three distinct, family-safe meals", () => {
  const plan = generateDailyPlan("2026-10-01", []);
  assert.equal(plan.date, "2026-10-01");
  assert.equal(plan.breakfast.type, "breakfast");
  assert.equal(plan.lunch.type, "lunch");
  assert.equal(plan.dinner.type, "dinner");
  assert.equal(new Set([plan.breakfast.protein, plan.lunch.protein, plan.dinner.protein]).size, 3);
  const selectedMeals = JSON.stringify([plan.breakfast, plan.lunch, plan.dinner]).toLocaleLowerCase();
  assert.ok(!selectedMeals.includes("gawar"));
  assert.ok(!selectedMeals.includes("fish"));
});

test("recent meals lose variety points and are not immediately repeated", () => {
  const first = generateDailyPlan("2026-10-01", []);
  const recent = [first.breakfast, first.lunch, first.dinner].map((meal) => ({
    mealId: meal.id,
    protein: meal.protein,
    grain: meal.grain,
    servedOn: "2026-10-01",
  }));
  const second = generateDailyPlan("2026-10-02", recent);
  assert.notEqual(second.breakfast.id, first.breakfast.id);
  assert.notEqual(second.lunch.id, first.lunch.id);
  assert.notEqual(second.dinner.id, first.dinner.id);
});

test("rejects malformed plan dates", () => {
  assert.throws(() => generateDailyPlan("tomorrow", []), /YYYY-MM-DD/);
});

test("accepts Hindi, Roman Hindi, and English plan approvals", () => {
  for (const reply of ["ठीक है", "theek hai", "Thik hai!", "OK", "looks good"]) {
    assert.equal(isPlanApprovalReply(reply), true, reply);
  }
  assert.equal(isPlanApprovalReply("Breakfast: poha"), false);
});

test("future suggestions use the supplied weekly meal reference and omit fruits",()=>{
 const plan=generateDailyPlan('2026-10-05',[]);
 assert.match(plan.breakfast.name,/Moong-paneer/);assert.match(plan.lunch.name,/Masoor dal/);assert.match(plan.dinner.name,/Palak paneer/);
 assert.doesNotMatch(JSON.stringify([plan.breakfast,plan.lunch,plan.dinner]),/guava|banana|papaya|mosambi|orange|apple/i);
});
