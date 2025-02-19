"use client"

import { useState, useEffect } from "react"
import { MagnifyingGlass } from "@phosphor-icons/react";
import { Header } from "./header"
import { Spotlight } from "../ui/spotlight-new";
import { Carousel } from "../carousel";
import type { Result } from "@/lib/result";
import type { FullAnimeRecord } from "@/lib/types";

type Card = Pick<FullAnimeRecord, 'mal_id' | 'titles' | 'images' | 'type'>
export function LandingPage({ currentSeasonAnimes, allTimeFavorites, isDarkMode }: { currentSeasonAnimes: Result<Card[], Error>, allTimeFavorites: Result<Card[], Error>; isDarkMode: boolean }) {
  const [showMainSearch, setShowMainSearch] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      const searchField = document.getElementById("search-field")
      if (searchField) {
        const searchFieldPosition = searchField.getBoundingClientRect().top
        const threshold = 120 // Same threshold as in StickyHeader
        setShowMainSearch(searchFieldPosition > threshold)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen dark:text-white text-gray-900">
      <Header isDarkMode={isDarkMode} />
      <Spotlight />
      <main>
        <div className="flex flex-col items-center justify-center px-4 text-center h-screen">
          <div className="mb-8 relative">
            <div className="w-32 h-32 bg-gradient-to-br from-pink-500 via-purple-600 to-blue-600 rounded-3xl flex items-center justify-center transform rotate-12 mb-4">
              <span className="text-6xl font-bold text-white transform -rotate-12">A</span>
            </div>
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-pink-500/20 rounded-full blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-purple-500/20 rounded-full blur-xl"></div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#FF6B9C] via-[#B46EE8] to-[#634FE8] bg-clip-text text-transparent">
            Discover Your Next Anime
            <span className="inline-block ml-2">✨</span>
          </h1>

          <p className={`max-w-2xl dark:text-gray-400 text-gray-600 text-lg mb-8`}>
            Your gateway to the world of anime. Find your next favorite series with our
            <span className="text-[#B46EE8]"> intelligent search</span> and personalized recommendations.
          </p>

          <div
            id="search-field"
            className={`flex flex-col sm:flex-row gap-4 mb-12 w-full max-w-2xl px-4 transition-opacity duration-300 ${showMainSearch ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
          >
            <div className="relative flex-1">
              <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="search"
                placeholder="Search by title, genre, or studio..."
                className="w-full dark:bg-[#1A1B26] dark:border-gray-800 dark:text-white dark:placeholder:text-gray-500 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 border rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <button className="px-8 py-3 bg-[#E93D82] text-white rounded-lg font-medium hover:opacity-90 transition-opacity whitespace-nowrap">
              Search Anime
            </button>
          </div>
        </div>
        <div className="w-full max-w-6xl mx-auto mt-16 space-y-16">
          {currentSeasonAnimes.success ? (
            <section>
              <h2 className="`text-2xl font-bold mb-6 dark:text-white text-gray-900`">
                Trending Anime
              </h2>
              <Carousel animes={currentSeasonAnimes.value} />
            </section>
          ) : null}
          {allTimeFavorites.success ? (
            <section>
              <h2 className="`text-2xl font-bold mb-6 dark:text-white text-gray-900`">
                All-Time Favorites
              </h2>
              <Carousel animes={allTimeFavorites.value} />
            </section>
          ) : null}

          <section>
            <h2 className="`text-2xl font-bold mb-6 dark:text-white text-gray-900`">
              Popular This Season
            </h2>
          </section>

          <section>
            <h2 className="`text-2xl font-bold mb-6 dark:text-white text-gray-900`">
              All-Time Favorites
            </h2>
          </section>

          <section>
            <h2 className="`text-2xl font-bold mb-6 dark:text-white text-gray-900`">
              New Releases
            </h2>
            <div className="h-[1000px]">
              hi
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}


