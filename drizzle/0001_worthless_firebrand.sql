CREATE TABLE `tracked_entity` (
	`id` text(255) PRIMARY KEY NOT NULL,
	`user_id` text(64) NOT NULL,
	`user_type` text NOT NULL,
	`entity_status` text(255) NOT NULL,
	`mal_id` integer NOT NULL,
	`created_at` text,
	`updated_at` text
);
