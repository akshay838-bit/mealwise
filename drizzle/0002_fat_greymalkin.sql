ALTER TABLE `grocery_requests` ADD `quantity_overrides_json` text DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE `grocery_requests` ADD `plan_date` text;