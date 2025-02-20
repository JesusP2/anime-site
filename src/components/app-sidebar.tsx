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
  SidebarRail,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { buttonVariants } from "./ui/button";
import type { User } from 'better-auth';
import { ThemeButton } from "./theme-button";

const data = {
  navMain: [
    {
      title: "Animes",
      url: "#",
      icon: TelevisionSimple,
      items: [
        {
          title: "Completed",
          url: "/animes/completed",
          icon: CheckCircle,
        },
        {
          title: "Planned to Watch",
          url: "/animes/planned",
          icon: CalendarCheck,
        },
        {
          title: "Dropped",
          url: "/animes/dropped",
          icon: Trash,
        },
        {
          title: "Watching",
          url: "/animes/watching",
          icon: MonitorPlay,
        },
        {
          title: "On Hold",
          url: "/animes/on-hold",
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
          url: "/mangas/completed",
          icon: CheckCircle,
        },
        {
          title: "Planned to Watch",
          url: "/mangas/planned",
          icon: CalendarCheck,
        },
        {
          title: "Dropped",
          url: "/mangas/dropped",
          icon: Trash,
        },
        {
          title: "Watching",
          url: "/mangas/watching",
          icon: MonitorPlay,
        },
        {
          title: "On Hold",
          url: "/mangas/on-hold",
          icon: PauseCircle,
        },
      ],
    },
  ],
};

export function AppSidebar({
  children,
  user,
  isSidebarOpen,
  isDarkMode,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  isSidebarOpen: boolean;
  isDarkMode: boolean;
  user: User | null;
}) {

  return (
    <SidebarProvider defaultOpen={isSidebarOpen}>
      <Sidebar collapsible="icon" {...props} variant="floating">
        <SidebarHeader className="p-1 pt-2">
          <SidebarMenu>
            <SidebarMenuItem className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <SidebarMenuButton className="truncate font-semibold" asChild>
                <a href="/">
                  <div className="flex items-center gap-2">
                    <img src="/favicon.svg" className="aspect-square size-6" />
                    <span className="sm:block hidden text-lg font-semibold">AniSearch</span>
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
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <SidebarTrigger />
        {children}
      </SidebarInset>
    </SidebarProvider >
  );
}
