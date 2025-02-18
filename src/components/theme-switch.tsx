import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";
import { useId, useRef, useState } from "react";
import { flushSync } from "react-dom";

export function ThemeSwitch(props: { isDarkMode: boolean; }) {
  const id = useId();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(props.isDarkMode);
  const ref = useRef<HTMLDivElement>(null);

  function setTheme(isDarkMode: boolean) {
    setIsDarkMode(isDarkMode);
    document.documentElement.classList[isDarkMode ? "add" : "remove"]("dark");
    document.cookie = `theme=${isDarkMode ? 'dark' : 'light'}`;
  }

  async function toggleTheme(isDarkMode: boolean) {
    if (!document.startViewTransition) {
      setTheme(isDarkMode)
      return;
    }
    await document.startViewTransition(() => {
      flushSync(() => {
        setTheme(isDarkMode)
      })
    }).ready
    const x = ref.current?.getBoundingClientRect().left;
    const y = ref.current?.getBoundingClientRect().top;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const diagonal = Math.sqrt(width ** 2 + height ** 2);
    const duration = diagonal / 3;
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${diagonal}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: duration,
        easing: 'ease-in-out',
        pseudoElement: '::view-transition-new(root)',
      }
    );
  }

  return (
    <div ref={ref}>
      <div className="relative inline-grid h-[30px] grid-cols-[1fr_1fr] items-center text-sm font-medium">
        <Switch
          id={id}
          checked={isDarkMode}
          onCheckedChange={toggleTheme}
          className="peer absolute inset-0 h-[inherit] w-auto data-[state=unchecked]:bg-input/50 [&_span]:z-10 [&_span]:h-full [&_span]:w-1/2 [&_span]:transition-transform [&_span]:duration-300 [&_span]:[transition-timing-function:cubic-bezier(0.16,1,0.3,1)] data-[state=checked]:[&_span]:translate-x-full rtl:data-[state=checked]:[&_span]:-translate-x-full"
        />
        <span className="pointer-events-none relative ms-0.5 flex min-w-7 items-center justify-center text-center transition-transform duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] peer-data-[state=checked]:invisible peer-data-[state=unchecked]:translate-x-full rtl:peer-data-[state=unchecked]:-translate-x-full">
          <Moon size={16} strokeWidth={2} aria-hidden="true" />
        </span>
        <span className="pointer-events-none relative me-0.5 flex min-w-7 items-center justify-center text-center transition-transform duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] peer-data-[state=unchecked]:invisible peer-data-[state=checked]:-translate-x-full peer-data-[state=checked]:text-background rtl:peer-data-[state=checked]:translate-x-full">
          <Sun size={16} strokeWidth={2} aria-hidden="true" />
        </span>
      </div>
      <Label htmlFor={id} className="sr-only">
        Labeled switch
      </Label>
    </div>
  );
}
