DROP INDEX `team_up_votes_voter_hero_rank_unique`;--> statement-breakpoint
ALTER TABLE `team_up_votes` ADD `season` text DEFAULT 'Season 09' NOT NULL;--> statement-breakpoint
ALTER TABLE `team_up_votes` ADD `patch` text DEFAULT 'S9 Launch' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `team_up_votes_voter_hero_rank_era_unique` ON `team_up_votes` (`voter_id`,`hero_id`,`rank`,`season`,`patch`);