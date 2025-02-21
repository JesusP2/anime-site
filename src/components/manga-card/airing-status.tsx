import type { MangaCardItem } from "@/lib/types";

export function AiringStatus({ anime }: { anime: MangaCardItem }) {
  const getStatusStyle = () => {
    switch (anime.status?.toLowerCase()) {
      case "publishing":
        return "border-green-600 text-green-600 dark:border-green-500 dark:bg-green-500/10 dark:text-green-400";
      case "finished":
        return "border-stone-400 text-stone-600 dark:border-gray-500 dark:bg-gray-500/10 dark:text-gray-300";
      case "hiatus":
        return "border-stone-400 text-stone-600 dark:border-gray-500 dark:bg-gray-500/10 dark:text-gray-300";
      case "discontinued":
        return "border-stone-400 text-stone-600 dark:border-gray-500 dark:bg-gray-500/10 dark:text-gray-300";
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
