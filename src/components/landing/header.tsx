import { useState, useEffect } from "react";
import { List, MagnifyingGlass } from "@phosphor-icons/react";
import type { User } from "better-auth";
import { buttonVariants } from "../ui/button";
import { UserDropdown } from "../user-dropdown";
import { cn } from "@/lib/utils";
import { navigate } from "astro:transitions/client";
import { ThemeButton } from "../theme-button";

export function Header({
  isDarkMode,
  user,
}: {
  isDarkMode: boolean;
  user: User | null;
}) {
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const searchField = document.getElementById("search-field");
      if (searchField) {
        const searchFieldPosition = searchField.getBoundingClientRect().top;
        const threshold = 120; // Increased threshold to start transition earlier
        setShowSearch(searchFieldPosition <= threshold);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  // 60px - 128px

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        showSearch ? "bg-background" : "bg-background/10",
      )}
    >
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between p-4 lg:px-8">
          <div className="flex items-center gap-2">
            <img src="/favicon.svg" className="aspect-square size-6" />
            <span className="sm:block hidden text-lg font-semibold">
              AniSearch
            </span>
          </div>

          <div
            className={`transform transition-all duration-500 ${
              showSearch ? "w-[50%] opacity-100" : "w-0 opacity-0"
            }`}
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <MagnifyingGlass className="w-5 h-5 text-gray-400" />
              </div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  const search = new URLSearchParams();
                  search.set("q", (formData.get("q") as string) ?? "");
                  await navigate(`/anime/search?${search.toString()}`);
                }}
              >
                <input
                  type="search"
                  name="q"
                  placeholder="Search anime..."
                  className="w-full text-gray-900 dark:bg-[#1A1B26] border border-gray-200 dark:border-gray-800 rounded-lg py-2 pl-10 pr-4 text-sm placeholder:text-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 animate-liquid-merge"
                />
              </form>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-6">
              <a href="/anime/completed">
                <span className="text-netrual-400">My Animes</span>
              </a>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <ThemeButton isDarkMode={isDarkMode} />
              {user ? (
                <UserDropdown user={user} />
              ) : (
                <a className={buttonVariants()} href="/auth/signin">
                  Login
                </a>
              )}
            </div>
            <button className="md:hidden text-gray-400 hover:text-white">
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
