import { useState, useEffect } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { Header } from "./header";
import { Spotlight } from "../ui/spotlight-new";
import { Carousel } from "../carousel";
import type { Result } from "@/lib/result";
import type { FullAnimeRecord, FullMangaRecord } from "@/lib/types";
import type { User } from "better-auth";
import { buttonVariants } from "../ui/button";
import { navigate } from "astro:transitions/client";

type AnimeCard = Pick<FullAnimeRecord, "mal_id" | "titles" | "images" | "type">;
type MangaCard = Pick<FullMangaRecord, "mal_id" | "titles" | "images" | "type">;
export function LandingPage({
  currentSeasonAnimes,
  allTimeFavorites,
  popularThisSeasonAnimes,
  topMangas,
  isDarkMode,
  user,
}: {
  currentSeasonAnimes: Result<AnimeCard[], Error>;
  allTimeFavorites: Result<AnimeCard[], Error>;
  popularThisSeasonAnimes: Result<AnimeCard[], Error>;
  topMangas: Result<MangaCard[], Error>;
  isDarkMode: boolean;
  user: User | null;
}) {
  const [showMainSearch, setShowMainSearch] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const searchField = document.getElementById("search-field");
      if (searchField) {
        const searchFieldPosition = searchField.getBoundingClientRect().top;
        const threshold = 120; // Same threshold as in StickyHeader
        setShowMainSearch(searchFieldPosition > threshold);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen dark:text-white text-gray-900">
      <Header isDarkMode={isDarkMode} user={user} />
      <Spotlight />
      <main>
        <div className="flex flex-col items-center justify-center px-4 text-center h-screen">
          <div className="mb-8 relative">
            <img src="/favicon.svg" className="size-32  transform rotate-12" />
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-pink-500/20 rounded-full blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-purple-500/20 rounded-full blur-xl"></div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#FF6B9C] via-[#B46EE8] to-[#634FE8] bg-clip-text text-transparent">
            Discover Your Next Anime
            <span className="inline-block ml-2">✨</span>
          </h1>

          <p
            className={`max-w-2xl dark:text-gray-400 text-gray-600 text-lg mb-8`}
          >
            Your gateway to the world of anime. Find your next favorite series
            with our
            <span className="text-[#B46EE8]"> intelligent search</span> and
            personalized recommendations.
          </p>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const search = new URLSearchParams();
              search.set("q", (formData.get("q") as string) ?? "");
              await navigate(`/anime/search?${search.toString()}`);
            }}
          >
            <div
              id="search-field"
              className={`flex flex-col sm:flex-row gap-4 mb-12 w-full max-w-2xl px-4 transition-opacity duration-300 ${
                showMainSearch ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <div className="relative flex-1">
                <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="search"
                  name="q"
                  placeholder="Search by title, genre, or studio..."
                  className="w-full dark:bg-[#1A1B26] dark:border-gray-800 dark:text-white dark:placeholder:text-gray-500 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 border rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <button className="px-8 py-3 bg-[#E93D82] text-white rounded-lg font-medium hover:opacity-90 transition-opacity whitespace-nowrap">
                Search Anime
              </button>
            </div>
          </form>
        </div>
        <div className="w-full max-w-7xl mx-auto mt-16 space-y-16">
          {currentSeasonAnimes.success ? (
            <section>
              <Carousel
                header={
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold font-gabarito font-medium">
                      Current Season
                    </h2>
                    <a
                      href="/search?"
                      className={buttonVariants({ variant: "link" })}
                    >
                      View more
                    </a>
                  </div>
                }
                records={currentSeasonAnimes.value}
                type="ANIME"
              />
            </section>
          ) : null}
          {allTimeFavorites.success ? (
            <section>
              <Carousel
                header={
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold font-gabarito font-medium">
                      All Time Favorites
                    </h2>
                    <a
                      href="/seasons/now"
                      className={buttonVariants({ variant: "link" })}
                    >
                      View more
                    </a>
                  </div>
                }
                records={allTimeFavorites.value}
                type="ANIME"
              />
            </section>
          ) : null}

          {popularThisSeasonAnimes.success ? (
            <section>
              <Carousel
                header={
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold font-gabarito font-medium">
                      Popular this season
                    </h2>
                    <a
                      href="/seasons/now"
                      className={buttonVariants({ variant: "link" })}
                    >
                      View more
                    </a>
                  </div>
                }
                records={popularThisSeasonAnimes.value}
                type="ANIME"
              />
            </section>
          ) : null}
          {topMangas.success ? (
            <section>
              <Carousel
                header={
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold font-gabarito font-medium">
                      Top Mangas
                    </h2>
                    <a
                      href="/seasons/now"
                      className={buttonVariants({ variant: "link" })}
                    >
                      View more
                    </a>
                  </div>
                }
                records={topMangas.value}
                type="MANGA"
              />
            </section>
          ) : null}
        </div>
      </main>
    </div>
  );
}
