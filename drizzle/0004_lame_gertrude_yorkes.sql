DROP INDEX `tracked_entity__user_id__mal_id`;--> statement-breakpoint
ALTER TABLE `tracked_entity` ADD `user_id_mal_id` text(255) NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `tracked_entity_user_id_mal_id_unique` ON `tracked_entity` (`user_id_mal_id`);