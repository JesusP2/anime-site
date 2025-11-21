ALTER TABLE "anime" ALTER COLUMN "embedding" SET DATA TYPE vector(768);--> statement-breakpoint
ALTER TABLE "manga" ALTER COLUMN "embedding" SET DATA TYPE vector(768);