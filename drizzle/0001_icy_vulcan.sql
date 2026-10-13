CREATE TABLE `grocery_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`source_message_id` text NOT NULL,
	`ingredients_json` text NOT NULL,
	`status` text DEFAULT 'requested' NOT NULL,
	`preview_json` text,
	`created_at` text NOT NULL,
	`approved_at` text,
	`order_id` text,
	`payment_url` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `grocery_requests_source_message_id_unique` ON `grocery_requests` (`source_message_id`);