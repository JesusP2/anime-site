import { CaretRight } from "@phosphor-icons/react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useRef } from "react";
import type { IconRef } from "@/lib/types";
import { SearchIcon } from "./ui/search";
import { BookTextIcon } from "./ui/book-text";
import { ClapIcon } from "./ui/clap";
import { CircleCheckIcon } from "./ui/circle-check";
import { CalendarCheckIcon } from "./ui/calendar-check";
import { DeleteIcon } from "./ui/delete";
import { MonitorCheckIcon } from "./ui/monitor-check";
import { PauseIcon } from "./ui/pause";

import { CalendarCheck, MusicNote } from "@phosphor-icons/react";
import { AudioLinesIcon } from "./ui/audio-lines";

const nav = [
  {
    title: "Animes",
    url: "#",
    Icon: ClapIcon,
    items: [
      {
        title: "Completed",
        url: "/anime/completed",
        Icon: CircleCheckIcon,
      },
      {
        title: "Planned to Watch",
        url: "/anime/planned",
        Icon: CalendarCheckIcon,
      },
      {
        title: "Dropped",
        url: "/anime/dropped",
        Icon: DeleteIcon,
      },
      {
        title: "Watching",
        url: "/anime/watching",
        Icon: MonitorCheckIcon,
      },
      {
        title: "On Hold",
        url: "/anime/on-hold",
        Icon: PauseIcon,
      },
    ],
  },
  {
    title: "Mangas",
    url: "#",
    Icon: BookTextIcon,
    items: [
      {
        title: "Completed",
        url: "/manga/completed",
        Icon: CircleCheckIcon,
      },
      {
        title: "Planned to Watch",
        url: "/manga/planned",
        Icon: CalendarCheckIcon,
      },
      {
        title: "Dropped",
        url: "/manga/dropped",
        Icon: DeleteIcon,
      },
      {
        title: "Watching",
        url: "/manga/watching",
        Icon: MonitorCheckIcon,
      },
      {
        title: "On Hold",
        url: "/manga/on-hold",
        Icon: PauseIcon,
      },
    ],
  },
  {
    title: "Anime Quizzes",
    url: "#",
    Icon: AudioLinesIcon,
    items: [
      {
        title: "Home",
        url: "/themes/quiz",
        Icon: AudioLinesIcon,
      },
      {
        title: "Create Quiz",
        url: "/themes/quiz/create",
        Icon: AudioLinesIcon,
      },
      {
        title: "My Quizzes",
        url: "/themes/quiz/my-quizzes",
        Icon: CalendarCheckIcon,
      },
    ],
  },
];

export function NavMain() {
  const searchRef = useRef<IconRef>(null);
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <a
              href="/search"
              onMouseEnter={() => searchRef.current?.startAnimation()}
              onMouseLeave={() => searchRef.current?.stopAnimation()}
            >
              <SearchIcon className="size-4 p-0" ref={searchRef} />
              Search
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
        {nav.map((item) => {
          const ref = useRef<IconRef>(null);
          return (
            <Collapsible key={item.title} asChild className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    onMouseEnter={() => ref.current?.startAnimation?.()}
                    onMouseLeave={() => ref.current?.stopAnimation?.()}
                  >
                    {item.Icon && <item.Icon ref={ref} size={16} />}
                    <span>{item.title}</span>
                    <CaretRight
                      weight="bold"
                      className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => {
                      const ref = useRef<IconRef>(null);
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            onMouseEnter={() => ref.current?.startAnimation?.()}
                            onMouseLeave={() => ref.current?.stopAnimation?.()}
                          >
                            <a href={subItem.url}>
                              {subItem.Icon && (
                                <subItem.Icon ref={ref} size={16} />
                              )}
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
