ALTER TABLE "quiz_to_theme" DROP CONSTRAINT "quiz_to_theme_theme_id_theme_id_fk";
--> statement-breakpoint
ALTER TABLE "quiz_to_theme" ADD CONSTRAINT "quiz_to_theme_theme_id_anime_theme_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."anime_theme"("id") ON DELETE no action ON UPDATE no action;