CREATE TABLE `hero_insights` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`hero_id` text NOT NULL,
	`voter_id` text NOT NULL,
	`display_name` text DEFAULT 'Anonymous' NOT NULL,
	`rank` text,
	`patch` text DEFAULT 'S9 Launch' NOT NULL,
	`body` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `hero_insights_hero_time_idx` ON `hero_insights` (`hero_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `insight_reactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`insight_id` integer NOT NULL,
	`voter_id` text NOT NULL,
	`value` integer DEFAULT 0 NOT NULL,
	`flagged` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `insight_reactions_insight_voter_unique` ON `insight_reactions` (`insight_id`,`voter_id`);--> statement-breakpoint
CREATE INDEX `insight_reactions_insight_idx` ON `insight_reactions` (`insight_id`);