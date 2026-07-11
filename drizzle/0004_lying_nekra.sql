CREATE TABLE `blocked_devices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`voter_id` text NOT NULL,
	`reason` text DEFAULT 'Blocked by moderator' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `blocked_devices_voter_unique` ON `blocked_devices` (`voter_id`);--> statement-breakpoint
CREATE TABLE `meta_eras` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`season` text NOT NULL,
	`patch` text NOT NULL,
	`status` text DEFAULT 'archived' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `meta_eras_season_patch_unique` ON `meta_eras` (`season`,`patch`);