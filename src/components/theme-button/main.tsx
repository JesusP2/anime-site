import { Moon, Sun } from "@phosphor-icons/react";
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
    <div className="flex flex-col justify-center">
      <input
        type="checkbox"
        name={id}
        id={id}
        className="peer sr-only"
        checked={isDarkMode}
        onChange={(e) => toggleTheme(e.target.checked, ref, cb)}
      />
      <label
        ref={ref}
        className="group relative inline-flex size-8 cursor-pointer items-center justify-center rounded-lg border border-input bg-background text-foreground shadow-sm shadow-black/5 transition-colors hover:bg-accent hover:text-accent-foreground peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-ring/70"
        htmlFor={id}
        aria-label={`Switch to ${isDarkMode ? "dark" : "light"} mode`}
      >
        {/* Note: After dark mode implementation, rely on dark: prefix rather than peer-checked:group-[]: */}
        <Moon
          size={16}
          strokeWidth={2}
          className="shrink-0 scale-0 opacity-0 transition-all peer-checked:group-[]:scale-100 peer-checked:group-[]:opacity-100"
          aria-hidden="true"
        />
        <Sun
          size={16}
          strokeWidth={2}
          className="absolute shrink-0 scale-100 opacity-100 transition-all peer-checked:group-[]:scale-0 peer-checked:group-[]:opacity-0"
          aria-hidden="true"
        />
      </label>
    </div>
  );
}
