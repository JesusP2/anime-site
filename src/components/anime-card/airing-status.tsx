import type { AnimeCardItem } from "@/lib/types";

export function AiringStatus({ anime }: { anime: AnimeCardItem }) {
  const getStatusStyle = () => {
    switch (anime.status?.toLowerCase()) {
      case "currently airing":
        return "border-green-600 text-green-600 dark:border-green-500 dark:bg-green-500/10 dark:text-green-400";
      case "finished airing":
        return "border-stone-400 text-stone-600 dark:border-gray-500 dark:bg-gray-500/10 dark:text-gray-300";
      case "not yet aired":
        return "border-blue-600 text-blue-600 dark:border-blue-500 dark:bg-blue-500/10 dark:text-blue-400";
      default:
        return "border-stone-400 text-stone-600 dark:border-gray-500 dark:bg-gray-500/10 dark:text-gray-300";
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
