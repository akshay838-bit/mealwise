CREATE TABLE `meal_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`plan_date` text NOT NULL,
	`meal_type` text NOT NULL,
	`meal_id` text NOT NULL,
	`meal_name` text NOT NULL,
	`protein` text NOT NULL,
	`grain` text NOT NULL,
	`recorded_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `meal_history_date_type_unique` ON `meal_history` (`plan_date`,`meal_type`);--> statement-breakpoint
CREATE TABLE `meal_plans` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`plan_date` text NOT NULL,
	`breakfast_id` text NOT NULL,
	`breakfast_name` text NOT NULL,
	`lunch_id` text NOT NULL,
	`lunch_name` text NOT NULL,
	`dinner_id` text NOT NULL,
	`dinner_name` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`scores_json` text NOT NULL,
	`created_at` text NOT NULL,
	`approved_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `meal_plans_plan_date_unique` ON `meal_plans` (`plan_date`);