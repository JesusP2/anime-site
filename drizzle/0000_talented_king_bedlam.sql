CREATE TABLE `anime` (
	`id` text(255) PRIMARY KEY NOT NULL,
	`mal_id` integer,
	`url` text,
	`images` text,
	`trailer` text,
	`approved` integer,
	`titles` text,
	`type` text(255),
	`source` text(255),
	`episodes` integer,
	`status` text(255),
	`airing` integer,
	`aired` text,
	`duration` text(255),
	`rating` text(255),
	`score` integer,
	`scored_by` integer,
	`rank` integer,
	`popularity` integer,
	`members` integer,
	`favorites` integer,
	`synopsis` text,
	`background` text,
	`season` text(255),
	`year` integer,
	`broadcast` text,
	`producers` text,
	`licensors` text,
	`studios` text,
	`genres` text,
	`explicit_genres` text,
	`themes` text,
	`demographics` text,
	`relations` text,
	`theme` text,
	`external` text,
	`streaming` text,
	`created_at` text,
	`updated_at` text
);
--> statement-breakpoint
CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `passkey` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`public_key` text NOT NULL,
	`user_id` text NOT NULL,
	`credential_i_d` text NOT NULL,
	`counter` integer NOT NULL,
	`device_type` text NOT NULL,
	`backed_up` integer NOT NULL,
	`transports` text,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer NOT NULL,
	`image` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`username` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `character` (
	`id` text(255) PRIMARY KEY NOT NULL,
	`mal_id` integer,
	`url` text,
	`images` text,
	`name` text,
	`name_kanji` text,
	`nicknames` text,
	`favorites` integer,
	`about` text,
	`anime` text,
	`manga` text,
	`voices` text,
	`created_at` text,
	`updated_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `character_mal_id_unique` ON `character` (`mal_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `character_url_unique` ON `character` (`url`);--> statement-breakpoint
CREATE TABLE `manga` (
	`id` text(255) PRIMARY KEY NOT NULL,
	`mal_id` integer,
	`url` text(255),
	`images` text,
	`approved` integer,
	`titles` text,
	`title_synonyms` text,
	`type` text(255),
	`chapters` integer,
	`volumes` integer,
	`status` text(255),
	`publishing` integer,
	`published` text,
	`score` integer,
	`scored_by` integer,
	`rank` integer,
	`popularity` integer,
	`members` integer,
	`favorites` integer,
	`synopsis` text,
	`background` text,
	`authors` text,
	`serializations` text,
	`genres` text,
	`explicit_genres` text,
	`themes` text,
	`demographics` text,
	`relations` text,
	`external` text,
	`created_at` text,
	`updated_at` text
);
