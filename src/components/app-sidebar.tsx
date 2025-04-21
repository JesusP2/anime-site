import { NavMain } from "@/components/nav-main";
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
import { Button } from "./ui/button";
import type { User } from "better-auth";
import { ThemeButton } from "./theme-button/main";
import { Separator } from "./ui/separator";
import { SearchWithFilters } from "./search";
import { type Entity, type EntityStatus } from "@/lib/types";
import { ArrowLeft } from "@phosphor-icons/react";

type SearchProps =
  | {
    page: "Search";
    searchType: Entity;
  }
  | {
    page: "mal_id";
  }
  | {
    page: Entity;
    entityStatus: EntityStatus;
  };

export function AppSidebar({
  children,
  user,
  dropdown,
  isSidebarOpen,
  isDarkMode,
  url,
  title,
  searchProps,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  dropdown?: React.ReactNode;
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
              <SidebarMenuButton className="truncate font-semibold hover:bg-inherit" asChild>
                <a href="/">
                  <div className="flex items-center gap-2">
                    <img src="/favicon.svg" className="aspect-square size-6" />
                    <span className="sm:block hidden text-lg font-semibold">
                      NotMyAnimeList
                    </span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <NavMain />
          <div className="mx-3 group-data-[collapsible=icon]:mx-auto">
            <ThemeButton isDarkMode={isDarkMode} />
          </div>
        </SidebarContent>
        <SidebarFooter>
          {dropdown}
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
            {searchProps.page === 'mal_id' && (
              <Button variant="ghost" onClick={() => window.history.back()}>
                <ArrowLeft className="size-4" weight="bold" />
              </Button>
            )}
            <h2 className="mr-4 whitespace-nowrap">
              {title}
            </h2>
            <SearchWithFilters url={url} {...searchProps} />
          </div>
        </header>
        <main className="py-2">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
