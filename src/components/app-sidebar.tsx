import * as React from "react";
import {
  Trash,
  CalendarCheck,
  MonitorPlay,
  PauseCircle,
  CheckCircle,
  TelevisionSimple,
  Book,
  SignIn,
  MusicNote,
} from "@phosphor-icons/react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { buttonVariants } from "./ui/button";
import type { User } from "better-auth";
import { ThemeButton } from "./theme-button/main";
import { Separator } from "./ui/separator";
import { SearchWithFilters } from "./search";
import type { Entity, EntityStatus } from "@/lib/types";

const data = {
  navMain: [
    {
      title: "Animes",
      url: "#",
      icon: TelevisionSimple,
      items: [
        {
          title: "Completed",
          url: "/anime/completed",
          icon: CheckCircle,
        },
        {
          title: "Planned to Watch",
          url: "/anime/planned",
          icon: CalendarCheck,
        },
        {
          title: "Dropped",
          url: "/anime/dropped",
          icon: Trash,
        },
        {
          title: "Watching",
          url: "/anime/watching",
          icon: MonitorPlay,
        },
        {
          title: "On Hold",
          url: "/anime/on-hold",
          icon: PauseCircle,
        },
      ],
    },
    {
      title: "Mangas",
      url: "#",
      icon: Book,
      items: [
        {
          title: "Completed",
          url: "/manga/completed",
          icon: CheckCircle,
        },
        {
          title: "Planned to Watch",
          url: "/manga/planned",
          icon: CalendarCheck,
        },
        {
          title: "Dropped",
          url: "/manga/dropped",
          icon: Trash,
        },
        {
          title: "Watching",
          url: "/manga/watching",
          icon: MonitorPlay,
        },
        {
          title: "On Hold",
          url: "/manga/on-hold",
          icon: PauseCircle,
        },
      ],
    },
    {
      title: "Anime Quizzes",
      url: "#",
      icon: MusicNote,
      items: [
        {
          title: "Home",
          url: "/themes/quiz",
          icon: MusicNote,
        },
        {
          title: "Create Quiz",
          url: "/themes/quiz/create",
          icon: MusicNote,
        },
        {
          title: "My Quizzes",
          url: "/themes/quiz/my-quizzes",
          icon: CalendarCheck,
        },
      ],
    },
  ],
};

type SearchProps =
  | {
    page: "Search";
    searchType: Entity;
  }
  | {
    page: Entity;
    entityStatus: EntityStatus;
  };

export function AppSidebar({
  children,
  user,
  isSidebarOpen,
  isDarkMode,
  url,
  title,
  searchProps,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  isSidebarOpen: boolean;
  isDarkMode: boolean;
  user: User | null;
  searchProps: SearchProps;
  url: string;
  title: string;
}) {
  return (
    <SidebarProvider defaultOpen={isSidebarOpen}>
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader className="p-1 pt-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="truncate font-semibold" asChild>
                <a href="/">
                  <div className="flex items-center gap-2">
                    <img src="/favicon.svg" className="aspect-square size-6" />
                    <span className="sm:block hidden text-lg font-semibold">
                      AniSearch
                    </span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={data.navMain} />
          <div className="mx-3 group-data-[collapsible=icon]:mx-auto">
            <ThemeButton isDarkMode={isDarkMode} />
          </div>
        </SidebarContent>
        <SidebarFooter>
          {user ? (
            <NavUser user={user} />
          ) : (
            <a className={buttonVariants()} href="/auth/signin">
              <SignIn className="w-5 h-5" weight="bold" />
              <span className="group-data-[collapsible=icon]:hidden">
                Login
              </span>
            </a>
          )}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="border">
        <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-14 flex h-14 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
          <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mx-2 data-[orientation=vertical]:h-4"
            />
            <h1 className="mr-4">
              {title}
            </h1>
            <SearchWithFilters url={url} {...searchProps} />
          </div>
        </header>
        <main className="py-2">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
