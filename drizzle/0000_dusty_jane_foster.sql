CREATE TABLE `team_up_votes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`voter_id` text NOT NULL,
	`hero_id` text NOT NULL,
	`ability_id` text NOT NULL,
	`rank` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `team_up_votes_voter_hero_rank_unique` ON `team_up_votes` (`voter_id`,`hero_id`,`rank`);