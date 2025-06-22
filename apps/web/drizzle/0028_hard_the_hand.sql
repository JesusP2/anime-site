-- Custom SQL migration file, put your code below! --

-- Create materialized view for optimized theme selection
CREATE MATERIALIZED VIEW theme_popularity_view AS
SELECT 
    at.id as theme_id,
    at.anime_id,
    at.type as theme_type,
    at.title as theme_title,
    a.popularity as anime_popularity,
    ROW_NUMBER() OVER (ORDER BY a.popularity) as popularity_rank
FROM anime_theme at
JOIN anime a ON at.anime_id = a.id
WHERE a.popularity > 0
  AND at.type IS NOT NULL
  AND at.anime_id IS NOT NULL;

-- Create unique index first (required for CONCURRENT refresh)
CREATE UNIQUE INDEX idx_theme_popularity_unique ON theme_popularity_view (theme_id);

-- Create indexes on the materialized view for fast filtering
CREATE INDEX idx_theme_popularity_rank ON theme_popularity_view (popularity_rank);
CREATE INDEX idx_theme_popularity_type ON theme_popularity_view (theme_type);
CREATE INDEX idx_theme_popularity_anime ON theme_popularity_view (anime_id);
CREATE INDEX idx_theme_popularity_rank_type ON theme_popularity_view (popularity_rank, theme_type);

-- Create a function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_theme_popularity_view()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY theme_popularity_view;
EXCEPTION 
    WHEN OTHERS THEN
        -- Fallback to non-concurrent refresh if concurrent fails
        REFRESH MATERIALIZED VIEW theme_popularity_view;
END;
$$ LANGUAGE plpgsql;