import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PlayCircle,
  Star,
  TrendUp,
  Calendar,
  Globe,
  FilmStrip,
  UsersThree,
  Television,
  MusicNotes,
  Video as IconVideo,
  Link as IconLink,
  Broadcast as IconBroadcast,
  ListChecks,
  Hash,
  TreeStructure,
  MicrophoneStage,
  IdentificationBadge,
} from "@phosphor-icons/react";
import { useState, useEffect, useCallback } from "react";
import { StatusSelector } from "./status-selector";
import { MediaReviews } from "./media-reviews";
import { getRecordTitle } from "@/lib/anime-title";
import { VideoDialog } from "./video-dialog";
import type { GetReturnType } from "@/lib/types";
import type { getAnime } from "@/lib/anime/queries";

export function AnimeDetailsPage({
  anime,
}: {
  anime: GetReturnType<typeof getAnime>;
}) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewsOpen, setReviewsOpen] = useState(false);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Unknown";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const fetchAnimeReviews = useCallback(async () => {
    if (!anime.mal_id) return;
    try {
      setIsLoadingReviews(true);
      const response = await fetch(
        `https://api.jikan.moe/v4/anime/${anime.mal_id}/reviews`,
      );
      const data = await response.json();
      setReviews(data.data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
    } finally {
      setIsLoadingReviews(false);
    }
  }, [anime.mal_id]);

  useEffect(() => {
    if (reviewsOpen && reviews.length === 0 && anime.mal_id) {
      fetchAnimeReviews();
    }
  }, [reviewsOpen, anime.mal_id, fetchAnimeReviews]);

  const StatItem = ({
    icon,
    label,
    value,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string | number | null | undefined;
  }) =>
    value ? (
      <div className="flex items-center text-sm text-muted-foreground">
        {icon}
        <span className="ml-2">
          {label}: <strong className="text-foreground">{String(value)}</strong>
        </span>
      </div>
    ) : null;

  const SectionCard = ({
    title,
    icon,
    children,
  }: {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
  }) => (
    <Card className="shadow-lg_ transition-all duration-300 hover:shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );

  function getAutoplayUrl(url: string) {
    try {
      const u = new URL(url);
      if (
        u.hostname.includes("youtube.com") ||
        u.hostname.includes("youtu.be")
      ) {
        if (!u.searchParams.has("autoplay")) {
          u.searchParams.set("autoplay", "1");
        } else {
          u.searchParams.set("autoplay", "1");
        }
        return u.toString();
      }
      // For other video providers, try to append autoplay=1 if possible
      if (url.includes("autoplay=")) {
        return url.replace(/autoplay=\d/, "autoplay=1");
      }
      if (url.includes("?")) {
        return url + "&autoplay=1";
      }
      return url + "?autoplay=1";
    } catch {
      // fallback if URL parsing fails
      if (url.includes("autoplay=")) {
        return url.replace(/autoplay=\d/, "autoplay=1");
      }
      if (url.includes("?")) {
        return url + "&autoplay=1";
      }
      return url + "?autoplay=1";
    }
  }

  return (
    <div
      className="mx-auto space-y-8 px-4 max-w-7xl w-full"
      style={{ viewTransitionName: `anime-card-${anime.mal_id}` }}
    >
      <Card className="overflow-hidden shadow-2xl px-4">
        <div>
          <div className="md:flex">
            <div className="md:w-1/3 xl:w-1/4 relative min-w-[300px] h-[500px] rounded-lg">
              <img
                src={
                  anime.images?.jpg?.large_image_url ||
                  anime.images?.jpg?.image_url ||
                  "/placeholder-anime.jpg"
                }
                alt={getRecordTitle(anime.titles)}
                className="object-cover w-full rounded-lg  h-[500px]"
                style={{
                  viewTransitionName: `anime-card-img-${anime.mal_id}`,
                }}
              />
            </div>
            <div className="flex-1 space-y-6 bg-card text-card-foreground p-6">
              <div>
                <CardTitle
                  style={{
                    viewTransitionName: `anime-card-title-${anime.mal_id}`,
                  }}
                  className="text-4xl font-bold mb-1 text-primary flex items-center gap-2"
                >
                  {getRecordTitle(anime.titles)}
                  <StatusSelector data={anime} entityType="ANIME" />
                </CardTitle>
                {anime.titles
                  ?.filter(
                    (t) =>
                      ["English", "Japanese"].includes(t.type ?? "") &&
                      t.title !== getRecordTitle(anime.titles),
                  )
                  .map((title) => (
                    <p
                      key={title.title}
                      className="text-lg text-muted-foreground"
                    >
                      {title.title} ({title.type})
                    </p>
                  ))}
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                {anime.type && (
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    <Television size={16} className="mr-1 inline" />{" "}
                    {anime.type}
                  </Badge>
                )}
                {anime.status && (
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    <ListChecks size={16} className="mr-1 inline" />{" "}
                    {anime.status}
                  </Badge>
                )}
                {anime.rating && (
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    {anime.rating}
                  </Badge>
                )}
                {anime.season && anime.year && (
                  <Badge
                    variant="outline"
                    className="capitalize text-sm px-3 py-1"
                  >
                    <Calendar size={16} className="mr-1 inline" />{" "}
                    {anime.season} {anime.year}
                  </Badge>
                )}
              </div>

              <div className="flex items-start justify-between flex-wrap gap-4">
                {anime.score && (
                  <div className="flex items-center space-x-2 text-yellow-500">
                    <Star size={28} weight="fill" />
                    <div>
                      <span className="text-3xl font-bold text-foreground">
                        {anime.score.toFixed(2)}
                      </span>
                      <div className="text-xs text-muted-foreground">
                        {anime.scored_by
                          ? `${anime.scored_by.toLocaleString()} users`
                          : "No ratings"}
                      </div>
                    </div>
                  </div>
                )}
                <MediaReviews
                  title={getRecordTitle(anime.titles)}
                  reviews={reviews}
                  isLoading={isLoadingReviews}
                  open={reviewsOpen}
                  onOpenChange={setReviewsOpen}
                />
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
                <StatItem
                  icon={<FilmStrip size={18} />}
                  label="Episodes"
                  value={anime.episodes}
                />
                {anime.broadcast?.string && (
                  <StatItem
                    icon={<IconBroadcast size={18} />}
                    label="Broadcast"
                    value={anime.broadcast.string}
                  />
                )}
                <StatItem
                  icon={<UsersThree size={18} />}
                  label="Members"
                  value={anime.members?.toLocaleString()}
                />
                <StatItem
                  icon={<Hash size={18} />}
                  label="Rank"
                  value={anime.rank ? `#${anime.rank.toLocaleString()}` : "N/A"}
                />
                <StatItem
                  icon={<TrendUp size={18} />}
                  label="Popularity"
                  value={
                    anime.popularity
                      ? `#${anime.popularity.toLocaleString()}`
                      : "N/A"
                  }
                />
              </div>
            </div>
          </div>

          <div className="p-6 pl-0 space-y-6 bg-card text-card-foreground">
            {anime.synopsis && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Synopsis</h3>
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {anime.synopsis}
                </p>
              </div>
            )}

            {anime.genres && anime.genres.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {anime.genres.map((genre) => (
                    <Badge
                      key={genre.mal_id}
                      variant="default"
                      className="px-3 py-1"
                    >
                      {genre.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
              {anime.studios && anime.studios.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium mb-2">Studios</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    {anime.studios.map((studio) => (
                      <li key={studio.mal_id}>{studio.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {anime.themes && anime.themes.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium mb-2 flex items-center">
                    Content Themes
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {anime.themes.map((theme) => (
                      <Badge key={theme.mal_id} variant="outline">
                        {theme.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {anime.demographics && anime.demographics.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium mb-2 flex items-center">
                    Demographics
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {anime.demographics.map((demographic) => (
                      <Badge key={demographic.mal_id} variant="outline">
                        {demographic.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {anime.characters && anime.characters.length > 0 && (
        <SectionCard
          title="Characters & Voice Actors"
          icon={<UsersThree size={24} className="text-primary" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {anime.characters.map((characterEntry) => (
              <Card
                key={characterEntry.character?.mal_id}
                className="border p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4 items-start">
                  <Avatar className="h-20 w-20 rounded-md">
                    <AvatarImage
                      src={
                        characterEntry.character?.images?.jpg?.image_url || ""
                      }
                      alt={characterEntry.character?.name}
                    />
                    <AvatarFallback className="rounded-md text-lg">
                      {characterEntry.character?.name?.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold">
                      {characterEntry.character?.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {characterEntry.role}
                    </p>
                    {characterEntry.favorites && (
                      <p className="text-xs text-muted-foreground mt-1">
                        <Star
                          size={12}
                          className="inline mr-1 text-yellow-500"
                        />{" "}
                        {characterEntry.favorites.toLocaleString()} favorites
                      </p>
                    )}
                  </div>
                </div>

                {characterEntry.voice_actors &&
                  characterEntry.voice_actors.length > 0 && (
                    <div className="mt-3">
                      <Separator className="my-2" />
                      <h5 className="text-sm font-medium mb-2 flex items-center">
                        <MicrophoneStage
                          size={16}
                          className="mr-1 text-primary"
                        />
                        Voice Actors
                      </h5>
                      <ScrollArea className="h-32">
                        <div className="space-y-2 pr-2">
                          {characterEntry.voice_actors.map((va, index) => (
                            <div
                              key={`${va.person?.mal_id}-${index}`}
                              className="flex items-center gap-2 text-xs"
                            >
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={va.person?.images?.jpg?.image_url || ""}
                                  alt={va.person?.name}
                                />
                                <AvatarFallback className="text-xs">
                                  {va.person?.name?.substring(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="overflow-hidden">
                                <p className="truncate font-medium">
                                  {va.person?.name}
                                </p>
                                <p className="text-muted-foreground">
                                  {va.language}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
              </Card>
            ))}
          </div>
        </SectionCard>
      )}

      {anime.animethemes &&
        anime.animethemes.length > 0 &&
        anime.animethemes[0]?.id !== null && (
          <SectionCard
            title="Theme Songs (OP/ED)"
            icon={<MusicNotes size={24} className="text-primary" />}
          >
            <div className="space-y-6">
              {anime.animethemes.map((theme, index) => (
                <div
                  key={`${theme?.id}-${index}`}
                  className="border-l-4 border-primary pl-4 py-3 bg-card shadow-sm"
                >
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <span className="font-semibold text-primary mr-2 text-lg">
                        {theme?.slug} ({theme?.type})
                      </span>
                      <span className="text-muted-foreground text-sm">
                        {theme?.title} by {theme?.artist}
                      </span>
                    </div>
                  </div>

                  {theme?.entries?.map((entry) => (
                    <div key={entry?.id} className="mb-4 last:mb-0">
                      <div className="flex items-center mb-2 text-sm text-muted-foreground">
                        {entry?.version && (
                          <span className="font-medium mr-3">
                            Version {entry.version}
                          </span>
                        )}
                        {entry?.episodes && (
                          <span className="flex items-center mr-3">
                            <IconVideo className="mr-1" size={16} />
                            Eps: {entry.episodes}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {entry?.videos
                          ?.sort(
                            (a, b) =>
                              (a?.resolution || 0) - (b?.resolution || 0),
                          )
                          .map((video, videoIdx) => (
                            <VideoDialog
                              key={`${video?.id}-${videoIdx}`}
                              video={video}
                            />
                          ))}
                      </div>
                      {(!entry?.videos || entry.videos.length === 0) && (
                        <p className="text-xs text-muted-foreground">
                          No video links available for this entry.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </SectionCard>
        )}

      {anime.episodes_info && anime.episodes_info.length > 0 && (
        <SectionCard
          title="Episodes"
          icon={<FilmStrip size={24} className="text-primary" />}
        >
          <CardDescription className="mb-4">
            {anime.episodes
              ? `Total of ${anime.episodes} episodes.`
              : "Episode information available."}
          </CardDescription>
          <ScrollArea className="h-[500px] border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="w-32 hidden md:table-cell">
                    Aired
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {anime.episodes_info.map((episode: EpisodeInfo) => (
                  <TableRow key={episode.mal_id}>
                    <TableCell className="font-medium">
                      {episode.mal_id}
                    </TableCell>
                    <TableCell>
                      {episode.title}
                      {(episode.filler || episode.recap) && (
                        <div className="flex gap-1 mt-1">
                          {episode.filler && (
                            <Badge variant="destructive" className="text-xs">
                              Filler
                            </Badge>
                          )}
                          {episode.recap && (
                            <Badge variant="secondary" className="text-xs">
                              Recap
                            </Badge>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatDate(episode.aired)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </SectionCard>
      )}

      {anime.staff && anime.staff.length > 0 && (
        <SectionCard
          title="Staff"
          icon={<IdentificationBadge size={24} className="text-primary" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {anime.staff.map((staffMember: StaffEntry, index: number) => (
              <Card
                key={`${staffMember.person.mal_id}-${index}`}
                className="border p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4 items-start">
                  <Avatar className="h-16 w-16 rounded-md">
                    <AvatarImage
                      src={staffMember.person.images?.jpg?.image_url || ""}
                      alt={staffMember.person.name}
                    />
                    <AvatarFallback className="rounded-md">
                      {staffMember.person.name?.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="text-md font-semibold">
                      {staffMember.person.name}
                    </h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {staffMember.positions?.map(
                        (position: string, idx: number) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs"
                          >
                            {position}
                          </Badge>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </SectionCard>
      )}

      {((anime.streaming && anime.streaming.length > 0) ||
        (anime.external && anime.external.length > 0)) && (
        <SectionCard
          title="Where to Watch & Links"
          icon={<PlayCircle size={24} className="text-primary" />}
        >
          {anime.streaming && anime.streaming.length > 0 && (
            <>
              <h4 className="text-lg font-medium mb-2">Streaming Services</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {anime.streaming.map(
                  (stream: StreamingService, index: number) => (
                    <a
                      key={index}
                      href={stream.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="no-underline"
                    >
                      <Card className="hover:bg-accent transition-colors cursor-pointer shadow-sm hover:shadow-md p-2 rounded-sm">
                        <CardContent className="flex items-center gap-1.5 text-sm p-0">
                          <Globe size={16} />
                          <span>{stream.name}</span>
                        </CardContent>
                      </Card>
                    </a>
                  ),
                )}
              </div>
            </>
          )}

          {anime.external && anime.external.length > 0 && (
            <>
              <h4 className="text-lg font-medium mt-6 mb-2">External Links</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {anime.external.map((link: ExternalLink, index: number) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="no-underline"
                  >
                    <Card className="hover:bg-accent transition-colors cursor-pointer shadow-sm hover:shadow-md">
                      <CardContent className="flex items-center gap-1.5 text-sm">
                        <IconLink size={16} />
                        <span>{link.name}</span>
                      </CardContent>
                    </Card>
                  </a>
                ))}
              </div>
            </>
          )}
          {(!anime.streaming || anime.streaming.length === 0) &&
            (!anime.external || anime.external.length === 0) && (
              <p className="text-muted-foreground">
                No streaming or external link information available.
              </p>
            )}
        </SectionCard>
      )}

      {anime.trailer?.embed_url && (
        <SectionCard
          title="Trailer"
          icon={<IconVideo size={24} className="text-primary" />}
        >
          <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
            <video
              src={getAutoplayUrl(anime.trailer.embed_url)}
              className="w-full h-full object-contain bg-black"
              controls
              autoPlay
            />
          </div>
        </SectionCard>
      )}

      {anime.relations && anime.relations.length > 0 && (
        <SectionCard
          title="Related Anime"
          icon={<TreeStructure size={24} className="text-primary" />}
        >
          <Accordion type="single" collapsible className="w-full">
            {anime.relations.map((relation, index) => (
              <AccordionItem key={index} value={`relation-${index}`}>
                <AccordionTrigger className="text-base font-geist">
                  {relation.relation}
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2">
                    {relation.entry?.map((entry) => {
                      // Determine the route based on the type
                      const route =
                        entry.type?.toLowerCase() === "manga"
                          ? `/manga/${entry.mal_id}`
                          : `/anime/${entry.mal_id}`;

                      return (
                        <li
                          key={entry.mal_id}
                          className="flex items-center justify-between text-sm text-muted-foreground"
                        >
                          <a
                            href={route}
                            className="hover:text-primary hover:underline"
                          >
                            {entry.name}
                          </a>
                          <Badge variant="secondary" className="ml-2">
                            {entry.type}
                          </Badge>
                        </li>
                      );
                    })}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </SectionCard>
      )}
    </div>
  );
}
