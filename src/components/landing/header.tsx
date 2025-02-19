import { useState, useEffect } from "react"
import { List, MagnifyingGlass } from "@phosphor-icons/react"
import { ThemeSwitch } from "../theme-switch"
import type { User } from "better-auth";
import { buttonVariants } from "../ui/button";
import { UserDropdown } from "../user-dropdown";
import { cn } from "@/lib/utils";

export function Header({ isDarkMode, user }: { isDarkMode: boolean; user: User | null }) {
  const [showSearch, setShowSearch] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const searchField = document.getElementById("search-field")
      if (searchField) {
        const searchFieldPosition = searchField.getBoundingClientRect().top
        const threshold = 120 // Increased threshold to start transition earlier
        setShowSearch(searchFieldPosition <= threshold)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-300", showSearch ? "bg-background" : "bg-background/10")}
    >
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between p-4 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="font-bold text-white">A</span>
            </div>
            <span className="sm:block hidden text-lg font-semibold">AniSearch</span>
          </div>

          <div
            className={`transform transition-all duration-500 ${showSearch ? "w-[50%] opacity-100" : "w-0 opacity-0"
              }`}
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <MagnifyingGlass className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="search"
                placeholder="Search anime..."
                className="w-full dark:bg-[#1A1B26] border border-gray-200 dark:border-gray-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 animate-liquid-merge"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6">
              <ThemeSwitch isDarkMode={isDarkMode} />
              {user ? <UserDropdown user={user} /> : (
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
  )
}

