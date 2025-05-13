import { Button } from "react-aria-components";
import {
  DialogContent,
  DialogOverlay,
  DialogTrigger,
} from "@/components/ui/jolly/dialog";
import { PlayCircle } from "@phosphor-icons/react";
import { Badge } from "./ui/badge";

export function VideoDialog({ video }: { video: any }) {
  return (
    <DialogTrigger>
      <Button
        className="flex items-center gap-2 py-2 px-3 bg-secondary hover:bg-secondary/80 rounded-md text-sm text-secondary-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label={`Play ${video.resolution || "N/A"}P ${video.source} theme video`}
      >
        <PlayCircle size={20} weight="fill" />
        <span className="font-medium">{video.resolution || "N/A"}P</span>
        <Badge variant="outline" className="uppercase text-xs font-normal">
          {video.source}
        </Badge>
        {video.nc && (
          <Badge variant="outline" className="text-xs font-normal">
            NC
          </Badge>
        )}
        {video.tags && video.tags.includes("Lyrics") && (
          <Badge variant="outline" className="text-xs font-normal">
            Lyrics
          </Badge>
        )}
      </Button>
      <DialogOverlay>
        <DialogContent className="min-w-[70vw] min-h-[70vh] aspect-video !rounded-[0px] border-0 p-0">
          <video
            src={video.link}
            className="w-full h-full object-contain bg-black"
            controls
            autoPlay
          />
        </DialogContent>
      </DialogOverlay>
    </DialogTrigger>
  );
}
