import { useId, useRef, useState } from "react";
import { toggleTheme } from "./utils";

export function ThemeButton(props: { isDarkMode: boolean; onThemeChange?: (isDarkMode: boolean) => void; }) {
  const id = useId();
  const [isDarkMode, setIsDarkMode] = useState(props.isDarkMode);
  const ref = useRef<HTMLLabelElement>(null);

  function cb(isDarkMode: boolean) {
    props.onThemeChange?.(isDarkMode);
    setIsDarkMode(isDarkMode);
  }

  return (
    <div className="flex flex-col justify-center absolute top-0 left-[50%] size-40">
      <input
        type="checkbox"
        name={id}
        id={id}
        className="peer sr-only z-50"
        checked={isDarkMode}
        onChange={(e) => toggleTheme(e.target.checked, ref, cb)}
      />
      <label
        ref={ref}
        className="absolute top-0 size-40 z-50 cursor-pointer"
        htmlFor={id}
        aria-label={`Switch to ${isDarkMode ? "dark" : "light"} mode`}
      >
      </label>
      <div className="bg-[url('/sun.png')] dark:bg-[url('/moon.png')] bg-cover bg-no-repeat absolute top-0 size-40 z-10" />
    </div>
  );
}
