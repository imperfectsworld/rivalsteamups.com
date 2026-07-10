CREATE TABLE `team_up_vote_activity` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`voter_id` text NOT NULL,
	`ip_hash` text NOT NULL,
	`hero_id` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `vote_activity_voter_time_idx` ON `team_up_vote_activity` (`voter_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `vote_activity_ip_time_idx` ON `team_up_vote_activity` (`ip_hash`,`created_at`);