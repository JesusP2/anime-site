CREATE TABLE "anime_theme" (
	"id" text PRIMARY KEY NOT NULL,
	"anime_id" text,
	"animethemes_id" integer NOT NULL,
	"sequence" integer,
	"slug" text NOT NULL,
	"type" text,
	"title" text
);
--> statement-breakpoint
CREATE TABLE "theme_song_to_artist" (
	"id" text PRIMARY KEY NOT NULL,
	"theme_id" text NOT NULL,
	"artist_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "theme_artist" (
	"id" text PRIMARY KEY NOT NULL,
	"animethemes_id" integer NOT NULL,
	"name" text,
	"slug" text,
	"information" text
);
--> statement-breakpoint
CREATE TABLE "theme_audio" (
	"id" text PRIMARY KEY NOT NULL,
	"video_id" text NOT NULL,
	"animethemes_id" integer NOT NULL,
	"basename" text,
	"filename" text,
	"path" text,
	"size" integer,
	"link" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "theme_entry" (
	"id" text PRIMARY KEY NOT NULL,
	"theme_id" text NOT NULL,
	"animethemes_id" integer NOT NULL,
	"episodes" text,
	"sfw" boolean,
	"version" integer
);
--> statement-breakpoint
CREATE TABLE "theme_video" (
	"id" text PRIMARY KEY NOT NULL,
	"theme_entry_id" text NOT NULL,
	"animethemes_id" integer NOT NULL,
	"basename" text,
	"filename" text,
	"lyrics" boolean DEFAULT false,
	"nc" boolean DEFAULT false,
	"path" text,
	"resolution" integer,
	"size" integer,
	"source" text,
	"subbed" boolean DEFAULT false,
	"uncen" boolean DEFAULT false,
	"tags" text,
	"link" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "anime_theme" ADD CONSTRAINT "anime_theme_anime_id_anime_id_fk" FOREIGN KEY ("anime_id") REFERENCES "public"."anime"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "theme_song_to_artist" ADD CONSTRAINT "theme_song_to_artist_theme_id_anime_theme_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."anime_theme"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "theme_song_to_artist" ADD CONSTRAINT "theme_song_to_artist_artist_id_theme_artist_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."theme_artist"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "theme_audio" ADD CONSTRAINT "theme_audio_video_id_theme_video_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."theme_video"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "theme_entry" ADD CONSTRAINT "theme_entry_theme_id_anime_theme_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."anime_theme"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "theme_video" ADD CONSTRAINT "theme_video_theme_entry_id_theme_entry_id_fk" FOREIGN KEY ("theme_entry_id") REFERENCES "public"."theme_entry"("id") ON DELETE no action ON UPDATE no action;