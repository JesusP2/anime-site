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
import { useState } from "react"
import { actions } from "astro:actions"

export function StatusDropdown({ mal_id, defaultStatus }: { mal_id: number, defaultStatus: string; }) {
  async function handleStatusChange(newStatus: string) {
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
        <DropdownMenuRadioGroup defaultValue={defaultStatus} onValueChange={handleStatusChange}>
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


