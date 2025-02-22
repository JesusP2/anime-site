ALTER TABLE "manga" ALTER COLUMN "themes" SET DATA TYPE json;--> statement-breakpoint
ALTER TABLE "manga" ALTER COLUMN "themes" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "tracked_entity" ALTER COLUMN "entity_status" SET DATA TYPE varchar;