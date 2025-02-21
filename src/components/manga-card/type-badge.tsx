import { Badge } from "@/components/ui/badge";
import {
  PlayCircle,
  Book,
} from "@phosphor-icons/react";

interface MangaTypeBadgeProps {
  type: string;
}

export function MangaTypeBadge({ type }: MangaTypeBadgeProps) {
  const getTypeIcon = () => {
    switch (type.toLowerCase()) {
      case "manga":
        return <Book className="w-3 h-3" />;
      case "novel":
        return <Book className="w-3 h-3" />;
      case "light novel":
        return <Book className="w-3 h-3" />;
      case "oneshot":
        return <Book className="w-3 h-3" />;
      case "doujin":
        return <Book className="w-3 h-3" />;
      case "manhwa":
        return <Book className="w-3 h-3" />;
      case "manhua":
        return <Book className="w-3 h-3" />;
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
