import type { AstroGlobal } from "astro";
import { getAnimesWithStatus, getAnimesWithStatusCount } from "./anime/data-access";

export async function getAnimeRecordsByStatus(Astro: AstroGlobal, status: string, recordsPerPage = 25) {
	const _currentPage = Astro.url.searchParams.get("page") || "1";
	const currentPage = isNaN(parseInt(_currentPage || ""))
		? 1
		: parseInt(_currentPage);
	const searchParams = new URLSearchParams(Astro.url.searchParams);

	const [animesCount, animeRecords] = await Promise.all([
		getAnimesWithStatusCount(
			status,
			searchParams,
			recordsPerPage,
			Astro.locals.user?.id,
		),
		getAnimesWithStatus(
			status,
			searchParams,
			recordsPerPage,
			Astro.locals.user?.id,
		),
	]);
	return {
		animesCount,
		animeRecords,
		currentPage,
	}
}
