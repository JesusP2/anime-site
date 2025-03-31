import { ThemeButton } from "../theme-button";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export function NewLandingPage(props: { isDarkMode: boolean }) {
  return (
    <>
      <section className="h-screen">
        <ThemeButton isDarkMode={props.isDarkMode} />
        <div className="grid place-items-center space-y-10 px-10 :sm:px-20 md:px-28 lg:px-40 pt-10 sm:pt-20 md:pt-28 lg:pt-40">
          <h1 className="stroked-text font-crimson text-center text-4xl sm:text-5xl lg:text-7xl font-black max-w-4xl z-10">
            Search and track your favorite anime
          </h1>
          <h2 className="stroked-text text-center text-xl md:text-2xl font-semibold z-10">
            Explore a vast collection of anime, manga, and more.
          </h2>
          <div className="bg-background flex ring-1 ring-[#847858] p-2 space-x-2 rounded-lg inline-block max-w-xl w-full z-10 focus-within:ring-2 hover:ring-2">
            <input className="bg-inherit font-geist text-neutral-700 dark:text-neutral-300 w-full placeholder:text-neutral-700 dark:placeholder:text-neutral-300 outline-none focus:outline-none" placeholder="Search for anime, manga..." />
            <Button variant="outline">
              Search
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
