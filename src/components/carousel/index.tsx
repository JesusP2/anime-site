import { CarouselCard } from "./card";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { buttonVariants } from "../ui/button";
import type { FullAnimeRecord } from "@/lib/types";
const cardWidth = 225;
const gapBetweenCards = 16;
export function Carousel({ animes, header }: { animes: Pick<FullAnimeRecord, "mal_id" | "titles" | "images" | "type">[]; header: ReactNode; }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState(8);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [width, setWidth] = useState(0);
  const [translateWindow, setTranslateWindow] = useState(0);
  const [totalTranslate, setTotalTranslate] = useState(0);

  function handleResize() {
    const containerWidth = containerRef.current?.clientWidth;
    if (!containerWidth) return;
    const minTotal = Math.floor(
      (containerWidth + gapBetweenCards) / (cardWidth + gapBetweenCards),
    );
    const pages = Math.ceil(animes.length / minTotal) - 1;
    const translateWindow = 100 + (gapBetweenCards / containerWidth) * 100;
    setPages(pages);
    setTranslateWindow(translateWindow);
    setWidth((containerWidth - (minTotal - 1) * gapBetweenCards) / minTotal);
    setTotalTranslate(
      (pages - 1) * translateWindow +
      ((animes.length - pages * minTotal) / minTotal) * translateWindow,
    );
    if (currentIndex > pages) {
      setCurrentIndex(pages - 1);
    }
  }

  useEffect(() => {
    handleResize();
    const controller = new AbortController();
    window.addEventListener("resize", handleResize, {
      signal: controller.signal,
    });
    return () => controller.abort();
  }, [pages]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === pages ? 0 : prevIndex + 1));
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? pages : prevIndex - 1));
  };

  function calculateTranslate() {
    if (currentIndex === pages) {
      return totalTranslate;
    } else {
      return currentIndex * translateWindow;
    }
  }

  return (
    <div className="relative w-full mx-auto">
      {header}
      <div className="w-full h-[1px] bg-neutral-300" />
      <div
        ref={containerRef}
        className="overflow-hidden flex gap-x-4 my-2 w-full"
      >
        <div
          className="flex gap-x-4 my-2 transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${calculateTranslate()}%)` }}
        >
          {animes.map((anime, idx) => (
            <div key={`${anime.mal_id}-${idx}`} className="flex-shrink-0">
              <CarouselCard anime={anime} width={width} />
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={handlePrevious}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white"
        aria-label="Previous slide"
      >
        ←
      </button>
      <button
        onClick={handleNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white"
        aria-label="Next slide"
      >
        →
      </button>
    </div>
  );
}
