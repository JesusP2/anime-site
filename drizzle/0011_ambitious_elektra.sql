CREATE TABLE "game" (
	"id" text PRIMARY KEY NOT NULL,
	"creator_id" text NOT NULL,
	"quiz_id" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quiz" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"difficulty" text NOT NULL,
	"public" boolean NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quiz_to_theme" (
	"quiz_id" text NOT NULL,
	"theme_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "game" ADD CONSTRAINT "game_quiz_id_theme_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."theme"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_to_theme" ADD CONSTRAINT "quiz_to_theme_quiz_id_quiz_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quiz"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_to_theme" ADD CONSTRAINT "quiz_to_theme_theme_id_theme_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."theme"("id") ON DELETE no action ON UPDATE no action;