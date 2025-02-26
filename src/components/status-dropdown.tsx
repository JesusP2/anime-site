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
import { actions } from "astro:actions";
import { useEffect, type Dispatch, type SetStateAction } from "react";
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

export function StatusDropdown({ data, entityType, user, className, status, setStatus }: Props) {

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
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className={cn("rounded-sm mr-2", className)}>
          <RenderStatus status={status} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={status}
          onValueChange={(value) => handleStatusChange(value as EntityStatus)}
        >
          {entityStatuses.map((status) => (
            <DropdownMenuRadioItem
              key={status}
              value={status}
              className="flex items-center gap-2"
            >
              <RenderStatus status={status} />
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
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
