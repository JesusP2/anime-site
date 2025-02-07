import { AnimeCard, type AnimeCardItem } from "@/components/anime-card";
import { EmptyItems } from "@/components/empty-items";
import { Pagination } from "@/components/pagination";
import { SearchWithFilters } from "@/components/search";
import { UnexpectedError } from "@/components/unexpected-error";
import { animeFilters } from "@/lib/anime/filters";
import type { Result } from "@/lib/result";
import type { ActionError } from "astro:actions";
import { useState } from "react";

export function SeasonNowPage({ records, url }: { url: URL; records: Result<AnimeCardItem[], ActionError> }) {
	const [_records, _setRecords] = useState(records.success ? records.value : [])
	if (!records.success) {
		return <UnexpectedError />
	}
	if (!_records.length) {
		return <EmptyItems />
	}
	return (
		<>
			<SearchWithFilters
				url={url}
				onSearch={() => console.log('hi')}
				options={animeFilters}
				title="Animes this season"
			/>
			<div className="grid auto-fill-grid gap-6 px-10 w-full mx-auto">
				{
					_records.map((item) => (
						<AnimeCard key={item.mal_id} data={item} />
					))}
			</div>
  <div className="flex justify-center my-6">
    <Pagination
      url={new URL(Astro.url)}
      lastVisiblePage={Math.ceil(
        (animesCount.success ? animesCount.value : 1) / animesPerPage,
      )}
      currentPage={currentPage}
    />
  </div>
		</>
	)
}
