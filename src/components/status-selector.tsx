import {
  CalendarCheck,
  CheckCircle,
  MonitorPlay,
  PauseCircle,
  Trash,
} from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { actions } from "astro:actions";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type { User } from "better-auth";
import type {
  EntityStatus,
  FullAnimeRecord,
  FullMangaRecord,
} from "@/lib/types";
import {
  deleteAnimeFromLocalDB,
  getAnimeFromLocalDB,
  updateLocalAnime,
} from "@/lib/anime/pglite-queries";
import {
  deleteMangaFromLocalDB,
  getMangaFromLocalDB,
  updateLocalManga,
} from "@/lib/manga/pglite-queries";
import { entityStatuses } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Props = {
  user: User | null;
  className?: string;
  status?: EntityStatus;
  setStatus: Dispatch<SetStateAction<EntityStatus>>;
} & (
  | {
      entityType: "ANIME";
      data: FullAnimeRecord & {
        entityStatus?: EntityStatus;
        embedding: number[];
      };
    }
  | {
      entityType: "MANGA";
      data: FullMangaRecord & {
        entityStatus?: EntityStatus;
        embedding: number[];
      };
    }
);

export function StatusSelector({ data, entityType, user, className, status, setStatus }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      if (entityType === "ANIME") {
        getAnimeFromLocalDB(data.mal_id!)
          .then((record) => {
            if (record) {
              setStatus(record.entityStatus);
            } else {
              setStatus("not-started");
            }
          })
          .catch(console.error);
      } else {
        getMangaFromLocalDB(data.mal_id!)
          .then((record) => {
            if (record) {
              setStatus(record.entityStatus);
            } else {
              setStatus("not-started");
            }
          })
          .catch(console.error);
      }
    }
  }, []);

  async function handleStatusChange(newStatus: EntityStatus) {
    setStatus(newStatus);
    setOpen(false);
    
    if (!data.mal_id) return;
    if (user) {
      if (newStatus === "not-started") {
        await actions.deleteEntity({ mal_id: data.mal_id });
        return;
      } else {
        await actions.updateEntity({
          mal_id: data.mal_id,
          entityType,
          status: newStatus,
        });
      }
      return;
    }
    if (newStatus === "not-started") {
      if (entityType === "ANIME") {
        await deleteAnimeFromLocalDB(data.mal_id!);
      } else {
        await deleteMangaFromLocalDB(data.mal_id!);
      }
      return;
    }
    if (entityType === "ANIME") {
      await updateLocalAnime(data, newStatus);
    } else {
      await updateLocalManga(data, newStatus);
    }
  }

  // Content to display inside both drawer and dropdown
  const StatusOptions = () => (
    <>
      {entityStatuses.map((statusOption) => (
        <button
          key={statusOption}
          onClick={() => handleStatusChange(statusOption)}
          className={cn(
            "flex w-full items-center gap-2 px-3 py-2 text-left text-sm rounded-md",
            status === statusOption ? "bg-accent text-accent-foreground" : "hover:bg-muted"
          )}
        >
          <RenderStatus status={statusOption} />
        </button>
      ))}
    </>
  );
  
  // Create the trigger button that's common to both components
  const triggerButton = (
    <Button className={cn("rounded-sm mr-2", className)}>
      <RenderStatus status={status} />
    </Button>
  );

  return (
    <>
      {/* Show Dropdown on medium and larger screens */}
      <div className="hidden md:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {triggerButton}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={status}
              onValueChange={(value) => handleStatusChange(value as EntityStatus)}
            >
              {entityStatuses.map((statusOption) => (
                <DropdownMenuRadioItem
                  key={statusOption}
                  value={statusOption}
                  className="flex items-center gap-2"
                >
                  <RenderStatus status={statusOption} />
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Show Drawer on small screens */}
      <div className="md:hidden">
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            {triggerButton}
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Change Status</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 py-2 flex flex-col gap-2">
              <StatusOptions />
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
}

function RenderStatus({ status }: { status?: string }) {
  switch (status) {
    case undefined:
      return <>Loading...</>;
    case "completed":
      return (
        <>
          <CheckCircle className="h-4 w-4" />
          Completed
        </>
      );
    case "planned":
      return (
        <>
          <CalendarCheck className="h-4 w-4" />
          Planned to watch
        </>
      );
    case "dropped":
      return (
        <>
          <Trash className="h-4 w-4" />
          Dropped
        </>
      );
    case "watching":
      return (
        <>
          <MonitorPlay className="h-4 w-4" />
          Watching
        </>
      );
    case "on-hold":
      return (
        <>
          <PauseCircle className="h-4 w-4" />
          On hold
        </>
      );
    default:
      return <>Not started</>;
  }
} 
