ALTER TABLE "game" ALTER COLUMN "creator_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "quiz" ADD COLUMN "creator_id" text;