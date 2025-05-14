ALTER TABLE "quiz" RENAME TO "challenge";--> statement-breakpoint
ALTER TABLE "quiz_to_theme" RENAME TO "challenge_to_theme";--> statement-breakpoint
ALTER TABLE "game" RENAME COLUMN "quiz_id" TO "challenge_id";--> statement-breakpoint
ALTER TABLE "challenge_to_theme" RENAME COLUMN "quiz_id" TO "challenge_id";--> statement-breakpoint
ALTER TABLE "game" DROP CONSTRAINT "game_quiz_id_quiz_id_fk";
--> statement-breakpoint
ALTER TABLE "challenge_to_theme" DROP CONSTRAINT "quiz_to_theme_quiz_id_quiz_id_fk";
--> statement-breakpoint
ALTER TABLE "challenge_to_theme" DROP CONSTRAINT "quiz_to_theme_theme_id_anime_theme_id_fk";
--> statement-breakpoint
ALTER TABLE "game" ADD CONSTRAINT "game_challenge_id_challenge_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenge"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_to_theme" ADD CONSTRAINT "challenge_to_theme_challenge_id_challenge_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenge"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_to_theme" ADD CONSTRAINT "challenge_to_theme_theme_id_anime_theme_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."anime_theme"("id") ON DELETE cascade ON UPDATE no action;