DROP INDEX "anime_mal_id_unique";--> statement-breakpoint
DROP INDEX "session_token_unique";--> statement-breakpoint
DROP INDEX "user_email_unique";--> statement-breakpoint
DROP INDEX "user_username_unique";--> statement-breakpoint
DROP INDEX "character_mal_id_unique";--> statement-breakpoint
DROP INDEX "character_url_unique";--> statement-breakpoint
DROP INDEX "tracked_entity_user_id_mal_id_unique";--> statement-breakpoint
DROP INDEX "manga_mal_id_unique";--> statement-breakpoint
ALTER TABLE `anime` ALTER COLUMN "mal_id" TO "mal_id" integer NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `anime_mal_id_unique` ON `anime` (`mal_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `character_mal_id_unique` ON `character` (`mal_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `character_url_unique` ON `character` (`url`);--> statement-breakpoint
CREATE UNIQUE INDEX `tracked_entity_user_id_mal_id_unique` ON `tracked_entity` (`user_id_mal_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `manga_mal_id_unique` ON `manga` (`mal_id`);--> statement-breakpoint
ALTER TABLE `anime` ALTER COLUMN "images" TO "images" text NOT NULL;--> statement-breakpoint
ALTER TABLE `anime` ALTER COLUMN "titles" TO "titles" text NOT NULL;--> statement-breakpoint
ALTER TABLE `anime` ALTER COLUMN "episodes_info" TO "episodes_info" text NOT NULL;--> statement-breakpoint
ALTER TABLE `anime` ALTER COLUMN "aired" TO "aired" text NOT NULL;--> statement-breakpoint
ALTER TABLE `anime` ALTER COLUMN "broadcast" TO "broadcast" text NOT NULL;--> statement-breakpoint
ALTER TABLE `anime` ALTER COLUMN "producers" TO "producers" text NOT NULL;--> statement-breakpoint
ALTER TABLE `anime` ALTER COLUMN "licensors" TO "licensors" text NOT NULL;--> statement-breakpoint
ALTER TABLE `anime` ALTER COLUMN "studios" TO "studios" text NOT NULL;--> statement-breakpoint
ALTER TABLE `anime` ALTER COLUMN "genres" TO "genres" text NOT NULL;--> statement-breakpoint
ALTER TABLE `anime` ALTER COLUMN "explicit_genres" TO "explicit_genres" text NOT NULL;--> statement-breakpoint
ALTER TABLE `anime` ALTER COLUMN "themes" TO "themes" text NOT NULL;--> statement-breakpoint
ALTER TABLE `anime` ALTER COLUMN "demographics" TO "demographics" text NOT NULL;--> statement-breakpoint
ALTER TABLE `anime` ALTER COLUMN "relations" TO "relations" text NOT NULL;--> statement-breakpoint
ALTER TABLE `anime` ALTER COLUMN "theme" TO "theme" text NOT NULL;--> statement-breakpoint
ALTER TABLE `anime` ALTER COLUMN "external" TO "external" text NOT NULL;--> statement-breakpoint
ALTER TABLE `anime` ALTER COLUMN "streaming" TO "streaming" text NOT NULL;--> statement-breakpoint
ALTER TABLE `anime` ALTER COLUMN "characters" TO "characters" text NOT NULL;--> statement-breakpoint
ALTER TABLE `anime` ALTER COLUMN "staff" TO "staff" text NOT NULL;