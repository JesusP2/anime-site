DROP INDEX "anime_mal_id_unique";--> statement-breakpoint
DROP INDEX "session_token_unique";--> statement-breakpoint
DROP INDEX "user_email_unique";--> statement-breakpoint
DROP INDEX "user_username_unique";--> statement-breakpoint
DROP INDEX "character_mal_id_unique";--> statement-breakpoint
DROP INDEX "character_url_unique";--> statement-breakpoint
DROP INDEX "tracked_entity_user_id_mal_id_unique";--> statement-breakpoint
DROP INDEX "manga_mal_id_unique";--> statement-breakpoint
ALTER TABLE `anime` ALTER COLUMN "embedding" TO "embedding" F32_BLOB(1536);--> statement-breakpoint
CREATE UNIQUE INDEX `anime_mal_id_unique` ON `anime` (`mal_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `character_mal_id_unique` ON `character` (`mal_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `character_url_unique` ON `character` (`url`);--> statement-breakpoint
CREATE UNIQUE INDEX `tracked_entity_user_id_mal_id_unique` ON `tracked_entity` (`user_id_mal_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `manga_mal_id_unique` ON `manga` (`mal_id`);--> statement-breakpoint
ALTER TABLE `manga` ALTER COLUMN "embedding" TO "embedding" F32_BLOB(1536);