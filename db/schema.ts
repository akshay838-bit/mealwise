import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const mealPlans = sqliteTable("meal_plans", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  planDate: text("plan_date").notNull(),
  breakfastId: text("breakfast_id").notNull(),
  breakfastName: text("breakfast_name").notNull(),
  lunchId: text("lunch_id").notNull(),
  lunchName: text("lunch_name").notNull(),
  dinnerId: text("dinner_id").notNull(),
  dinnerName: text("dinner_name").notNull(),
  status: text("status", { enum: ["draft", "approved", "replaced"] }).notNull().default("draft"),
  scoresJson: text("scores_json").notNull(),
  createdAt: text("created_at").notNull(),
  approvedAt: text("approved_at"),
}, (table) => [uniqueIndex("meal_plans_plan_date_unique").on(table.planDate)]);

export const mealHistory = sqliteTable("meal_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  planDate: text("plan_date").notNull(),
  mealType: text("meal_type", { enum: ["breakfast", "lunch", "dinner"] }).notNull(),
  mealId: text("meal_id").notNull(),
  mealName: text("meal_name").notNull(),
  protein: text("protein").notNull(),
  grain: text("grain").notNull(),
  recordedAt: text("recorded_at").notNull(),
}, (table) => [uniqueIndex("meal_history_date_type_unique").on(table.planDate, table.mealType)]);

export const groceryRequests = sqliteTable("grocery_requests", {
  id: text("id").primaryKey(),
  sourceMessageId: text("source_message_id").notNull().unique(),
  ingredientsJson: text("ingredients_json").notNull(),
  quantityOverridesJson: text("quantity_overrides_json").notNull().default("{}"),
  planDate: text("plan_date"),
  selectionNotes: text("selection_notes"),
  status: text("status").notNull().default("requested"),
  previewJson: text("preview_json"),
  createdAt: text("created_at").notNull(),
  approvedAt: text("approved_at"),
  orderId: text("order_id"),
  paymentUrl: text("payment_url"),
});

export const whatsappSessions = sqliteTable("whatsapp_sessions", {
  phone: text("phone").primaryKey(),
  lastInboundAt: integer("last_inbound_at").notNull(),
});
export const groceryNotifications = sqliteTable("grocery_notifications", {
  id: text("id").primaryKey(),
  requestId: text("request_id").notNull(),
  body: text("body").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: text("created_at").notNull(),
  sentAt: text("sent_at"),
});
