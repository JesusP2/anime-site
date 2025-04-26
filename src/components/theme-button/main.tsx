import { useEffect, useRef, useState } from "react";
import { toggleTheme } from "./utils";
import { MoonIcon } from "../ui/moon";
import { SunIcon } from "../ui/sun";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
import type { IconRef } from "@/lib/types";
import { themeButtonId } from "@/lib/constants";

export function ThemeButton() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const ref = useRef<HTMLLabelElement>(null);
  const moonRef = useRef<IconRef>(null);
  const sunRef = useRef<IconRef>(null);

  function cb(isDarkMode: boolean) {
    setIsDarkMode(isDarkMode);
  }

  useEffect(() => {
    const isDarkMode = document.cookie.includes("theme=dark");
    setIsDarkMode(isDarkMode);
  }, [])

  return (
    <div className="flex flex-col justify-center">
      <input
        type="checkbox"
        name={themeButtonId}
        id={themeButtonId}
        className="peer sr-only"
        checked={isDarkMode}
        onChange={(e) => toggleTheme(e.target.checked, ref.current, cb)}
      />
      <label
        ref={ref}
        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'size-8 relative right-[1px]')}
        htmlFor={themeButtonId}
        suppressHydrationWarning
        aria-label={`Switch to ${isDarkMode ? "dark" : "light"} mode`}
      >
        <MoonIcon
          size={16}
          className="shrink-0 scale-0 opacity-0 transition-all dark:scale-100 dark:opacity-100"
          aria-hidden="true"
          ref={moonRef}
        />
        <SunIcon
          size={16}
          className="absolute shrink-0 scale-100 opacity-100 transition-all dark:scale-0 dark:opacity-0"
          aria-hidden="true"
          ref={sunRef}
        />
      </label>
    </div>
  );
}
