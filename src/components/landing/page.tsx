import { safeStartViewTransition } from "@/lib/safe-start-view-transition";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { navigate } from "astro:transitions/client";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { prefetch } from "astro/virtual-modules/prefetch.js";

export function LandingPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  useEffect(() => {
    prefetch(`/search?q=${debouncedSearch}`);
  }, [debouncedSearch]);
  return (
    <section className="h-screen">
      <div className="grid place-items-center space-y-10 px-10 :sm:px-20 md:px-28 lg:px-40 pt-10 sm:pt-20 md:pt-28 lg:pt-40">
        <h1 className="stroked-text font-crimson text-center text-4xl sm:text-5xl lg:text-7xl font-black max-w-4xl z-10">
          Search and track your favorite anime
        </h1>
        <h2 className="stroked-text text-center text-xl md:text-2xl font-semibold z-10">
          Explore a vast collection of anime, manga, and more.
        </h2>
        <form
          className="max-w-xl w-full"
          onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            const search = new URLSearchParams();
            search.set("q", (formData.get("q") as string) ?? "");
            safeStartViewTransition(() =>
              navigate(`/search?${search.toString()}`),
            );
          }}
        >
          <div className="flex gap-x-2 max-w-xl w-full">
            <Input
              className="bg-background w-full"
              name="q"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for anime, manga..."
            />
            <Button variant="outline">Search</Button>
          </div>
        </form>
      </div>
    </section>
  );
}
