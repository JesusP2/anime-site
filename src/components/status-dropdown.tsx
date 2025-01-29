import { CalendarCheck, CheckCircle, ListBullets, MonitorPlay, PauseCircle, Trash } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { actions } from "astro:actions"
import { useState } from "react";

export function StatusDropdown({ mal_id, defaultStatus }: { mal_id: number, defaultStatus: string; }) {
  const [status, setStatus] = useState(defaultStatus)
  async function handleStatusChange(newStatus: string) {
    setStatus(newStatus)
    await actions.updateEntity({ mal_id, status: newStatus })
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="size-[30px] rounded-sm mr-2">
          <ListBullets className="h-1 w-1" />
          <span className="sr-only">Open status menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={status} onValueChange={handleStatusChange}>
          <DropdownMenuRadioItem className="flex items-center gap-2" value="completed"><CheckCircle />Completed</DropdownMenuRadioItem>
          <DropdownMenuRadioItem className="flex items-center gap-2" value="planned"><CalendarCheck />Planned to watch</DropdownMenuRadioItem>
          <DropdownMenuRadioItem className="flex items-center gap-2" value="dropped"><Trash />Dropped</DropdownMenuRadioItem>
          <DropdownMenuRadioItem className="flex items-center gap-2" value="watching"><MonitorPlay />Watching</DropdownMenuRadioItem>
          <DropdownMenuRadioItem className="flex items-center gap-2" value="on-hold"><PauseCircle />On hold</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


