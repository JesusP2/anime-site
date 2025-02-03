import type { AnimeCardItem } from "./anime-card";

export function AiringStatus({ anime }: { anime: AnimeCardItem }) {
  const getStatusStyle = () => {
    switch (anime.status?.toLowerCase()) {
      case "currently airing":
        return "border-green-600 text-green-600";
      case "finished airing":
        return "border-stone-400 text-stone-600";
      case "not yet aired":
        return "border-blue-600 text-blue-600";
      default:
        return "border-stone-400 text-stone-600";
    }
  };
  const statusStyle = getStatusStyle();
  return (
    <div
      className={`border px-2 py-1 inline-block rounded-md text-sm ${statusStyle}`}
    >
      {anime.status}
    </div>
  );
}
