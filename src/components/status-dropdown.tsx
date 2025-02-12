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
import { useEffect, useState } from "react";
import type { User } from "better-auth";
import {
  TrackedAnimeRecordsKey,
  TrackedMangaRecordsKey,
} from "@/lib/constants";
import type { FullAnimeRecord } from "@/lib/types";
import { transformFullAnimeToAnimeCard } from "@/lib/utils/transform-full-anime-to-anime-card";

const statuses = [
  "completed",
  "planned",
  "dropped",
  "watching",
  "on-hold",
  "not-started",
];
export function StatusDropdown({
  data,
  entityType,
  user,
}: {
  data: FullAnimeRecord & { entityStatus?: string };
  entityType: "ANIME" | "MANGA";
  user: User | null;
}) {
  const [status, setStatus] = useState(data.entityStatus);

  useEffect(() => {
    if (!user) {
      const localStorageKey =
        entityType === "ANIME"
          ? TrackedAnimeRecordsKey
          : TrackedMangaRecordsKey;
      const storedRecords = JSON.parse(
        localStorage.getItem(localStorageKey) || "[]",
      );
      const storedRecord = storedRecords.find(
        (animeRecord: any) => animeRecord.mal_id === data.mal_id,
      );
      if (storedRecord) {
        setStatus(storedRecord.entityStatus);
      }
    }
  }, []);

  async function handleStatusChange(newStatus: string) {
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
    const localStorageKey =
      entityType === "ANIME" ? TrackedAnimeRecordsKey : TrackedMangaRecordsKey;
    const storedRecords = JSON.parse(
      localStorage.getItem(localStorageKey) || "[]",
    );
    if (newStatus === "not-started") {
      const filteredRecords = storedRecords.filter(
        (animeRecord: any) => animeRecord.mal_id !== data.mal_id,
      );
      localStorage.setItem(localStorageKey, JSON.stringify(filteredRecords));
      return;
    }
    const storedRecord = storedRecords.find(
      (animeRecord: any) => animeRecord.mal_id === data.mal_id,
    );
    if (storedRecord) {
      storedRecord.entityStatus = newStatus;
      localStorage.setItem(localStorageKey, JSON.stringify(storedRecords));
    } else {
      storedRecords.push(transformFullAnimeToAnimeCard(data, newStatus));
      localStorage.setItem(localStorageKey, JSON.stringify(storedRecords));
    }
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="rounded-sm mr-2">
          <RenderStatus status={status} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={status}
          onValueChange={handleStatusChange}
        >
          {statuses.map((status) => (
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
