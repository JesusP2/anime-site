DROP INDEX `tracked_entity_user_id_mal_id_unique`;--> statement-breakpoint
CREATE INDEX `tracked_entity__user_id__mal_id` ON `tracked_entity` (`user_id`,`mal_id`);