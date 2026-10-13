CREATE TABLE `grocery_notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`request_id` text NOT NULL,
	`body` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL,
	`sent_at` text
);
--> statement-breakpoint
CREATE TABLE `whatsapp_sessions` (
	`phone` text PRIMARY KEY NOT NULL,
	`last_inbound_at` integer NOT NULL
);
