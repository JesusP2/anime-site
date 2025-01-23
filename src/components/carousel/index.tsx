import type { components } from "@/lib/api/jikan.openapi";
import { CarouselCard } from "./card";
import { useEffect, useRef, useState } from "react";

const cardWidth = 225;
export function Carousel({ animes }: { animes: components['schemas']['anime_full'][] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState(1);
  const [translateRate, setTranslateRate] = useState(0);
  const [totalTranslate, setTotalTranslate] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    function calculateTranslateRate(containerWidth: number) {
      const completeCards = Math.floor(containerWidth / (cardWidth + 16));
      const translateRate = completeCards * (cardWidth + 16) / containerWidth;
      return translateRate;
    }
    function handleResize() {
      const containerWidth = containerRef.current?.clientWidth || 0;
      const translateRate = calculateTranslateRate(containerWidth);
      const total = (cardWidth + 16) * animes.length - 16;
      setTotalTranslate(Math.round((total / containerWidth * 100 - 100) * 100) / 100);
      setTranslateRate(translateRate * 100);
      setPages(Math.floor(total / (containerWidth * translateRate)));
    }
    handleResize();
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize);
  }, [])

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === pages ? 0 : prevIndex + 1
    );
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? pages : prevIndex - 1
    );
  };

  function calculateTranslate() {
    if (currentIndex === pages) {
      return totalTranslate;
    } else {
      return currentIndex * translateRate;
    }
  }

  return (
    <div className="relative w-full mx-auto">
      <div className="flex items-center justify-between">
        <p>Current season</p>
        <p>View more</p>
      </div>
      <div className="w-full h-[1px] bg-neutral-300" />
      <div ref={containerRef} className="overflow-hidden flex gap-x-4 my-2">
        <div className="flex gap-x-4 my-2 transition-transform duration-300 ease-in-out" style={{ transform: `translateX(-${calculateTranslate()}%)` }}>
          {animes.map((anime, idx) => (
            <div key={`${anime.mal_id}-${idx}`} className="flex-shrink-0">
              <CarouselCard anime={anime} />
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
