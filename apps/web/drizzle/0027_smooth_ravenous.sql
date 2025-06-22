CREATE INDEX "animeThemeAnimeIdIndex" ON "anime_theme" USING btree ("anime_id");--> statement-breakpoint
CREATE INDEX "animeThemeTypeIndex" ON "anime_theme" USING btree ("type");--> statement-breakpoint
CREATE INDEX "animeThemeAnimeIdTypeIndex" ON "anime_theme" USING btree ("anime_id","type");