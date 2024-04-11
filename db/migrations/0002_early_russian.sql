ALTER TABLE `users` RENAME COLUMN `name` TO `first_name`;--> statement-breakpoint
ALTER TABLE users ADD `last_name` text;--> statement-breakpoint
ALTER TABLE users ADD `is_verified` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE verifications ADD `created_at` text NOT NULL;
