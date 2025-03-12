CREATE TABLE "theme_2" (
	"id" text PRIMARY KEY NOT NULL,
	"anime_id" varchar NOT NULL,
	"type" varchar NOT NULL,
	"number" integer NOT NULL,
	"name" text NOT NULL,
	"url" jsonb NOT NULL,
	"youtube_query" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "theme_2" ADD CONSTRAINT "theme_2_anime_id_anime_id_fk" FOREIGN KEY ("anime_id") REFERENCES "public"."anime"("id") ON DELETE no action ON UPDATE no action;