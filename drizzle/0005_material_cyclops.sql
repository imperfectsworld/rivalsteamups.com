DROP INDEX `team_up_votes_voter_hero_rank_era_unique`;--> statement-breakpoint
ALTER TABLE `team_up_votes` ADD `platform` text DEFAULT 'PC' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `team_up_votes_voter_hero_rank_era_platform_unique` ON `team_up_votes` (`voter_id`,`hero_id`,`rank`,`season`,`patch`,`platform`);--> statement-breakpoint
ALTER TABLE `hero_insights` ADD `platform` text DEFAULT 'PC' NOT NULL;