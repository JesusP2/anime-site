import { Badge } from "@/components/ui/badge";
import {
  FilmStrip,
  TelevisionSimple,
  MusicNote,
  Megaphone,
  PlayCircle,
} from "@phosphor-icons/react";
import type { components } from "@/lib/api/jikan.openapi";

type AnimeType = components["schemas"]["anime_search_query_type"];

interface AnimeTypeBadgeProps {
  type: string;
}

export function AnimeTypeBadge({ type }: AnimeTypeBadgeProps) {
  const getTypeIcon = () => {
    switch (type.toLowerCase()) {
      case "movie":
        return <FilmStrip className="w-3 h-3" />;
      case "tv":
        return <TelevisionSimple className="w-3 h-3" />;
      case "music":
        return <MusicNote className="w-3 h-3" />;
      case "cm":
      case "pv":
        return <Megaphone className="w-3 h-3" />;
      case "ova":
      case "ona":
      case "special":
      case "tv_special":
      default:
        return <PlayCircle className="w-3 h-3" />;
    }
  };

  return (
    <Badge className="flex items-center gap-1">
      {getTypeIcon()}
      {type.charAt(0).toUpperCase() + type.toLowerCase().slice(1)}
    </Badge>
  );
}
