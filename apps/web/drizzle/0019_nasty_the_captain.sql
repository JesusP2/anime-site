ALTER TABLE "anime_themes_dump" ALTER COLUMN "mal_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "anime_theme" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "anime_theme" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "theme_artist" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "theme_artist" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "theme_audio" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "theme_audio" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "theme_entry" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "theme_entry" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "theme_video" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "theme_video" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "anime_themes_dump" ADD CONSTRAINT "anime_themes_dump_mal_id_anime_mal_id_fk" FOREIGN KEY ("mal_id") REFERENCES "public"."anime"("mal_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anime_theme" ADD CONSTRAINT "anime_theme_animethemes_id_unique" UNIQUE("animethemes_id");--> statement-breakpoint
ALTER TABLE "theme_artist" ADD CONSTRAINT "theme_artist_animethemes_id_unique" UNIQUE("animethemes_id");--> statement-breakpoint
ALTER TABLE "theme_audio" ADD CONSTRAINT "theme_audio_animethemes_id_unique" UNIQUE("animethemes_id");--> statement-breakpoint
ALTER TABLE "theme_entry" ADD CONSTRAINT "theme_entry_animethemes_id_unique" UNIQUE("animethemes_id");--> statement-breakpoint
ALTER TABLE "theme_video" ADD CONSTRAINT "theme_video_animethemes_id_unique" UNIQUE("animethemes_id");