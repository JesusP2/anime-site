ALTER TABLE "game" DROP CONSTRAINT "game_quiz_id_theme_id_fk";
--> statement-breakpoint
ALTER TABLE "game" ADD CONSTRAINT "game_quiz_id_quiz_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quiz"("id") ON DELETE no action ON UPDATE no action;