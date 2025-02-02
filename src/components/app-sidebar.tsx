import * as React from "react";
import {
  SealCheck,
  Trash,
  CalendarCheck,
  MonitorPlay,
  PauseCircle,
  CheckCircle,
  TelevisionSimple,
  Book,
  MagnifyingGlass,
  Calendar,
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

const data = {
  navMain: [
    {
      title: "Seasons",
      url: "#",
      icon: SealCheck,
      isActive: true,
      items: [
        {
          title: "Current season",
          url: "/seasons/now",
          icon: Calendar,
        },
        {
          title: "Search",
          url: "/seasons/search",
          icon: MagnifyingGlass,
        },
      ],
    },
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
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: { name: string; email: string; image?: string } | null;
}) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <SidebarMenuButton className="truncate font-semibold" asChild>
                <a href="/">
                  <img src="/banime.svg" className="aspect-square size-6" />
                  Anime site
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={data.navMain} />
        </SidebarContent>
        <SidebarFooter>
          {user ? (
            <NavUser user={user} />
          ) : (
            <a className={buttonVariants()} href="/auth/signin">
              Login
            </a>
          )}
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <SidebarTrigger />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
