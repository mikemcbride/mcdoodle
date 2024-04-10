CREATE INDEX `question_poll_idx` ON `questions` (`poll_id`);--> statement-breakpoint
CREATE INDEX `response_poll_idx` ON `responses` (`poll_id`);--> statement-breakpoint
CREATE INDEX `submission_poll_idx` ON `submissions` (`poll_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);