import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/neobrutalism/button";
import { ThemeButton } from "../theme-button";

const WINDOW_WIDTH = 1900;
const WINDOW_HEIGHT = 897;
const VIDEO_WIDTH = 360;
const VIDEO_HEIGHT = 528;
const VIDEO_X = 500;
const VIDEO_Y = 300;
export function NewLandingPage(props: { isDarkMode: boolean }) {
  const [isDarkMode, setIsDarkMode] = useState(props.isDarkMode);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showVideo, setShowVideo] = useState(false);
  useEffect(() => {
    function handleResize() {
      if (!videoRef.current) return;
      function getAspectRatio(base: number) {
        if (base < 0.4) {
          return base * 1.9;
        } else if (base < 0.5) {
          return base * 1.8;
        } else if (base < 0.6) {
          return base * 1.5;
        }
        return base;
      }
      const base = window.innerWidth / WINDOW_WIDTH;
      const aspectRatio = getAspectRatio(base);
      if (base < 0.4) {
        videoRef.current.width = VIDEO_WIDTH * aspectRatio;
        videoRef.current.height = VIDEO_HEIGHT * aspectRatio;
        videoRef.current.style.top = `${450 * aspectRatio}px`;
        videoRef.current.style.right = `${0 * aspectRatio}px`;
      } else if (base < 0.5) {
        videoRef.current.width = VIDEO_WIDTH * aspectRatio;
        videoRef.current.height = VIDEO_HEIGHT * aspectRatio;
        videoRef.current.style.top = `${350 * aspectRatio}px`;
        videoRef.current.style.right = `${0 * aspectRatio}px`;
      } else if (base < 0.6) {
        videoRef.current.width = VIDEO_WIDTH * aspectRatio;
        videoRef.current.height = VIDEO_HEIGHT * aspectRatio;
        videoRef.current.style.top = `${400 * aspectRatio}px`;
        videoRef.current.style.right = `${100 * aspectRatio}px`;
      } else {
        videoRef.current.width = VIDEO_WIDTH * aspectRatio;
        videoRef.current.height = VIDEO_HEIGHT * aspectRatio;
        videoRef.current.style.top = `${VIDEO_Y * aspectRatio}px`;
        videoRef.current.style.right = `${VIDEO_X * aspectRatio}px`;
      }
      setShowVideo(true);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return (
    <>
      <section className="h-screen">
        <div className="grid place-items-center space-y-10 px-10 :sm:px-20 md:px-28 lg:px-40 pt-10 sm:pt-20 md:pt-28 lg:pt-40">
          <h1 className="stroked-text font-crimson text-center text-4xl sm:text-5xl lg:text-7xl font-black max-w-4xl z-10">
            Search and track your favorite anime
          </h1>
          <h2 className="stroked-text text-center text-xl md:text-2xl font-semibold z-10">
            Explore a vast collection of anime, manga, and more.
          </h2>
          <div className="bg-[url('/input-field-bg-light.png')] dark:bg-[url('/input-field-bg-night.png')] flex ring-1 ring-[#847858] p-2 space-x-2 rounded-lg inline-block max-w-xl w-full z-10 focus-within:ring-2 hover:ring-2">
            <input className="bg-inherit font-geist text-neutral-700 dark:text-neutral-300 w-full placeholder:text-neutral-700 dark:placeholder:text-neutral-300 outline-none focus:outline-none" placeholder="Search for anime, manga..." />
            <Button className="bg-[url('/input-btn-bg-light.png')] dark:bg-[url('/input-btn-bg-night.png')] font-crimson text-md border-[1px] text-neutral-700 dark:text-neutral-300 border-neutral-700">
              Search
            </Button>
          </div>
        </div>
        {!isDarkMode && (
          <video ref={videoRef} autoPlay loop muted width="360" height="528" className="absolute" style={{
            top: `${VIDEO_Y}px`,
            right: `${VIDEO_X}px`,
          }}>
            {showVideo && (
              <>
                <source src="/girl-animation.webm" type="video/mp4" />
                Your browser does not support the video tag.
              </>
            )}
          </video>
        )}
      </section>
    </>
  )
}
