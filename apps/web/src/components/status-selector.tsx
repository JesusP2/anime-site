import {
  CalendarCheck,
  CheckCircle,
  Clock,
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
import { useEffect, useState } from "react";
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
import { authClient } from "@/lib/auth-client";

type Props = {
  className?: string;
} & (
    | {
      entityType: "ANIME";
      data: FullAnimeRecord;
    }
    | {
      entityType: "MANGA";
      data: FullMangaRecord;
    }
  );

export function StatusSelector({ data, entityType, className }: Props) {
  const [status, setStatus] = useState<EntityStatus | "loading">("loading");
  const [embedding, setEmbedding] = useState<number[] | null>(null);
  const [open, setOpen] = useState(false);
  const session = authClient.useSession();

  useEffect(() => {
    if (session.isPending) return;
    if (session.data?.user) {
      actions
        .getStatusFromMalId({
          mal_id: data.mal_id,
          entity: entityType,
        })
        .then((result) => {
          if (result.data) {
            setStatus(result.data);
          }
        });
      return;
    }
    if (entityType === "ANIME" && status === "loading") {
      getAnimeFromLocalDB(data.mal_id!)
        .then((record) => {
          if (record) {
            setStatus(record.entityStatus);
          } else {
            setStatus("not-started");
          }
        })
        .catch(console.error);
    } else if (entityType === "MANGA" && status === "loading") {
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
  }, [session]);

  async function handleStatusChange(newStatus: EntityStatus) {
    if (session.isPending) return;
    setStatus(newStatus);
    setOpen(false);

    if (!data.mal_id) return;
    if (session.data?.user) {
      if (newStatus === "not-started") {
        await actions.deleteEntity({ mal_id: data.mal_id });
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
    let _embedding = embedding;
    if (!_embedding) {
      const embedding = await actions.getEmbeddingFromMalId({
        mal_id: data.mal_id,
        entity: entityType,
      });
      if (embedding.data) {
        _embedding = embedding.data;
        setEmbedding(embedding.data);
      } else return;
    }
    if (entityType === "ANIME") {
      await updateLocalAnime(data, _embedding, newStatus);
    } else {
      await updateLocalManga(data, _embedding, newStatus);
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
            status === statusOption
              ? "bg-accent text-accent-foreground"
              : "hover:bg-muted",
          )}
        >
          <RenderStatus status={statusOption} />
        </button>
      ))}
    </>
  );

  const triggerButton = (
    <Button size="sm" variant="ghost" className={cn("rounded-sm mr-2 border", className)}>
      <RenderButtonStatus status={status} />
    </Button>
  );

  return (
    <>
      {/* Show Dropdown on medium and larger screens */}
      <div className="hidden md:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>{triggerButton}</DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={status}
              onValueChange={(value) =>
                handleStatusChange(value as EntityStatus)
              }
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
          <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
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

function RenderStatus({ status }: { status: EntityStatus | "loading" }) {
  switch (status) {
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
    case "not-started":
      return (
        <>
          <Clock className="h-4 w-4" />
          Not started
        </>
      );
    default:
      return <>loading...</>;
  }
}

function RenderButtonStatus({ status }: { status: EntityStatus | "loading" }) {
  switch (status) {
    case "completed":
      return (
        <>
          <CheckCircle className="h-4 w-4" />
        </>
      );
    case "planned":
      return (
        <>
          <CalendarCheck className="h-4 w-4" />
        </>
      );
    case "dropped":
      return (
        <>
          <Trash className="h-4 w-4" />
        </>
      );
    case "watching":
      return (
        <>
          <MonitorPlay className="h-4 w-4" />
        </>
      );
    case "on-hold":
      return (
        <>
          <PauseCircle className="h-4 w-4" />
        </>
      );
    case "not-started":
      return (
        <>
          <Clock className="h-4 w-4" />
        </>
      );
    default:
      return <>loading...</>;
  }
}
