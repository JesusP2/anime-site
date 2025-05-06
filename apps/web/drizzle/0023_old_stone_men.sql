ALTER TABLE "anime_theme" DROP CONSTRAINT "anime_theme_anime_id_anime_id_fk";
--> statement-breakpoint
ALTER TABLE "theme_song_to_artist" DROP CONSTRAINT "theme_song_to_artist_theme_id_anime_theme_id_fk";
--> statement-breakpoint
ALTER TABLE "theme_song_to_artist" DROP CONSTRAINT "theme_song_to_artist_artist_id_theme_artist_id_fk";
--> statement-breakpoint
ALTER TABLE "theme_audio" DROP CONSTRAINT "theme_audio_video_id_theme_video_id_fk";
--> statement-breakpoint
ALTER TABLE "theme_entry" DROP CONSTRAINT "theme_entry_theme_id_anime_theme_id_fk";
--> statement-breakpoint
ALTER TABLE "theme_video" DROP CONSTRAINT "theme_video_theme_entry_id_theme_entry_id_fk";
--> statement-breakpoint
ALTER TABLE "game" DROP CONSTRAINT "game_quiz_id_quiz_id_fk";
--> statement-breakpoint
ALTER TABLE "quiz_to_theme" DROP CONSTRAINT "quiz_to_theme_quiz_id_quiz_id_fk";
--> statement-breakpoint
ALTER TABLE "quiz_to_theme" DROP CONSTRAINT "quiz_to_theme_theme_id_anime_theme_id_fk";
--> statement-breakpoint
ALTER TABLE "anime_theme" ADD CONSTRAINT "anime_theme_anime_id_anime_id_fk" FOREIGN KEY ("anime_id") REFERENCES "public"."anime"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "theme_song_to_artist" ADD CONSTRAINT "theme_song_to_artist_theme_id_anime_theme_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."anime_theme"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "theme_song_to_artist" ADD CONSTRAINT "theme_song_to_artist_artist_id_theme_artist_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."theme_artist"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "theme_audio" ADD CONSTRAINT "theme_audio_video_id_theme_video_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."theme_video"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "theme_entry" ADD CONSTRAINT "theme_entry_theme_id_anime_theme_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."anime_theme"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "theme_video" ADD CONSTRAINT "theme_video_theme_entry_id_theme_entry_id_fk" FOREIGN KEY ("theme_entry_id") REFERENCES "public"."theme_entry"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game" ADD CONSTRAINT "game_quiz_id_quiz_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quiz"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_to_theme" ADD CONSTRAINT "quiz_to_theme_quiz_id_quiz_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quiz"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_to_theme" ADD CONSTRAINT "quiz_to_theme_theme_id_anime_theme_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."anime_theme"("id") ON DELETE cascade ON UPDATE no action;