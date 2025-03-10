import type { EntityStatus, FullAnimeRecord } from "@/lib/types";
import type { User } from "better-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Award, CalendarIcon, Clock, Globe, PlayCircle, Star, TrendingUp, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { StatusSelector } from "./status-selector";
import { MediaReviews } from "./media-reviews";

type Props = {
  anime: FullAnimeRecord & { entityStatus?: EntityStatus; embedding: number[] };
  user: User | null;
};

export function AnimeDetailsPage({ anime, user }: Props) {
  const [status, setStatus] = useState(anime.entityStatus as EntityStatus);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewsOpen, setReviewsOpen] = useState(false);

  const getMainTitle = () => {
    const animeTitle =
      anime.titles?.find((title) => title.type === "English")?.title ||
      anime.titles?.find((title) => title.type === "Default")?.title || 'Title';
    return animeTitle;
  };

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

  useEffect(() => {
    if (reviewsOpen && reviews.length === 0) {
      fetchAnimeReviews();
    }
  }, [reviewsOpen]);

  const fetchAnimeReviews = async () => {
    try {
      setIsLoadingReviews(true);
      const response = await fetch(`https://api.jikan.moe/v4/anime/${anime.mal_id}/reviews`);
      const data = await response.json();
      setReviews(data.data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  return (
    <div className="container mx-auto" style={{ viewTransitionName: `anime-card-${anime.mal_id}` }}>
      {/* Hero Section - Using flex instead of grid for better control */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Anime Image - with fixed width constraints */}
        <div className="w-2/3 lg:w-[320px] flex-shrink-0 mx-auto">
          <Card>
            <CardContent className="p-4">
              <div className="aspect-[2/3] relative overflow-hidden rounded-md">
                <img
                  style={{
                    viewTransitionName: `anime-card-img-${anime.mal_id}`,
                  }}
                  src={anime.images?.jpg?.large_image_url || "/placeholder-anime.jpg"}
                  alt={getMainTitle()}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="mt-4 space-y-2">
                <StatusSelector
                  data={anime}
                  status={status}
                  setStatus={setStatus}
                  entityType="ANIME"
                  className="w-full"
                  user={user}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Anime Details */}
        <div className="flex-grow">
          <Card className="h-full">
            <CardHeader>
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <CardTitle
                    style={{
                      viewTransitionName: `anime-card-title-${anime.mal_id}`,
                    }}
                    className="text-3xl font-bold">{getMainTitle()}</CardTitle>
                  {anime.titles?.filter(t => ['English', 'Default', 'Japanese'].includes(t.type as any)).map((title, index) => (
                    <CardDescription key={index} className="text-lg">
                      {title.title} {title.type && <span className="text-xs">({title.type})</span>}
                    </CardDescription>
                  ))}
                </div>
                <div className="flex items-center space-x-4">
                  {anime.score && (
                    <div className="text-center">
                      <div className="flex items-center">
                        <Star className="text-yellow-500 mr-1" size={20} />
                        <span className="text-xl font-bold">{anime.score.toFixed(2)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {anime.scored_by ? `${anime.scored_by.toLocaleString()} users` : "No ratings"}
                      </div>
                    </div>
                  )}
                  <MediaReviews
                    title={getMainTitle() || anime.title || "this anime"}
                    reviews={reviews}
                    isLoading={isLoadingReviews}
                    open={reviewsOpen}
                    onOpenChange={setReviewsOpen}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {anime.type && <Badge>{anime.type}</Badge>}
                {anime.status && <Badge variant="outline">{anime.status}</Badge>}
                {anime.rating && <Badge variant="secondary">{anime.rating}</Badge>}
                {anime.season && anime.year && (
                  <Badge variant="outline" className="capitalize">
                    {anime.season} {anime.year}
                  </Badge>
                )}
              </div>

              {/* Stats Grid - Added rank and popularity */}
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center">
                  <Clock className="mr-2" size={16} />
                  <span>{anime.duration || "Unknown duration"}</span>
                </div>
                {anime.episodes && (
                  <div className="flex items-center">
                    <PlayCircle className="mr-2" size={16} />
                    <span>{anime.episodes} episodes</span>
                  </div>
                )}
                {anime.broadcast?.string && (
                  <div className="flex items-center">
                    <CalendarIcon className="mr-2" size={16} />
                    <span>{anime.broadcast.string}</span>
                  </div>
                )}
                {anime.members && (
                  <div className="flex items-center">
                    <Users className="mr-2" size={16} />
                    <span>{anime.members.toLocaleString()} members</span>
                  </div>
                )}
                {anime.rank && (
                  <div className="flex items-center">
                    <Award className="mr-2" size={16} />
                    <span>Ranked #{anime.rank.toLocaleString()}</span>
                  </div>
                )}
                {anime.popularity && (
                  <div className="flex items-center">
                    <TrendingUp className="mr-2" size={16} />
                    <span>Popularity #{anime.popularity.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-medium mb-2">Synopsis</h3>
                <p className="text-sm leading-relaxed">
                  {anime.synopsis || "No synopsis available."}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {anime.genres?.map((genre) => (
                  <Badge key={genre.mal_id} variant="secondary">
                    {genre.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* The rest of your code remains the same */}
      {/* Tabs Section */}
      <Tabs defaultValue="details" className="w-full mt-2">
        <TabsList className="grid grid-cols-5 max-w-2xl mx-auto">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="episodes">Episodes</TabsTrigger>
          <TabsTrigger value="characters">Characters</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="streaming">Streaming</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Background */}
              {anime.background && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Background</h3>
                  <p className="text-sm">{anime.background}</p>
                </div>
              )}

              {/* Studios, Producers, Licensors */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {anime.studios && anime.studios.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Studios</h3>
                    <ul className="text-sm space-y-1">
                      {anime.studios.map((studio) => (
                        <li key={studio.mal_id}>{studio.name}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {anime.producers && anime.producers.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Producers</h3>
                    <ul className="text-sm space-y-1">
                      {anime.producers.map((producer) => (
                        <li key={producer.mal_id}>{producer.name}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {anime.licensors && anime.licensors.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Licensors</h3>
                    <ul className="text-sm space-y-1">
                      {anime.licensors.map((licensor) => (
                        <li key={licensor.mal_id}>{licensor.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Themes & Demographics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {anime.themes && anime.themes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Themes</h3>
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
                    <h3 className="text-lg font-medium mb-2">Demographics</h3>
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

              {/* Openings & Endings */}
              {(anime.theme?.openings?.length || anime.theme?.endings?.length) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {anime.theme?.openings && anime.theme.openings.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Opening Themes</h3>
                      <ul className="text-sm space-y-1">
                        {anime.theme.openings.map((opening, index) => (
                          <li key={index}>{opening}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {anime.theme?.endings && anime.theme.endings.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Ending Themes</h3>
                      <ul className="text-sm space-y-1">
                        {anime.theme.endings.map((ending, index) => (
                          <li key={index}>{ending}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Related Anime */}
              {anime.relations && anime.relations.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Related Anime</h3>
                  <Accordion type="single" collapsible className="w-full">
                    {anime.relations.map((relation, index) => (
                      <AccordionItem key={index} value={`relation-${index}`}>
                        <AccordionTrigger>{relation.relation}</AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-2">
                            {relation.entry?.map((entry) => (
                              <li key={entry.mal_id} className="flex items-center">
                                <span>{entry.name}</span>
                                <Badge variant="outline" className="ml-2">{entry.type}</Badge>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Episodes Tab */}
        <TabsContent value="episodes">
          <Card>
            <CardHeader>
              <CardTitle>Episodes</CardTitle>
              <CardDescription>
                {anime.episodes ? `Total of ${anime.episodes} episodes` : "Episode information not available"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {anime.episodes_info && anime.episodes_info.length > 0 ? (
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Ep.</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead className="w-32">Aired</TableHead>
                        <TableHead className="w-24 text-right">Duration</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {anime.episodes_info.map((episode) => (
                        <TableRow key={episode.mal_id}>
                          <TableCell className="font-medium">{episode.mal_id}</TableCell>
                          <TableCell>
                            {episode.title}
                            {(episode.filler || episode.recap) && (
                              <div className="flex gap-1 mt-1">
                                {episode.filler && <Badge variant="destructive">Filler</Badge>}
                                {episode.recap && <Badge variant="secondary">Recap</Badge>}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>{formatDate(episode.aired)}</TableCell>
                          <TableCell className="text-right">
                            {episode.duration ? `${Math.floor(episode.duration / 60)}m` : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No episode information available.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="characters">
          <Card>
            <CardHeader>
              <CardTitle>Characters & Voice Actors</CardTitle>
            </CardHeader>
            <CardContent>
              {anime.characters && anime.characters.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {anime.characters.map((character) => (
                    <Card key={character.character?.mal_id} className="border">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={character.character?.images?.jpg?.image_url || ""} />
                            <AvatarFallback>
                              {character.character?.name?.substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-medium">{character.character?.name}</h4>
                            <p className="text-sm text-muted-foreground">{character.role}</p>
                          </div>
                        </div>

                        {character.voice_actors && character.voice_actors.length > 0 && (
                          <div className="mt-4">
                            <Separator className="my-2" />
                            <div className="text-sm font-medium mb-2">Voice Actors</div>
                            <div className="grid grid-cols-2 gap-2">
                              {character.voice_actors.slice(0, 4).map((va, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={va.person?.images?.jpg?.image_url || ""} />
                                    <AvatarFallback>
                                      {va.person?.name?.substring(0, 2)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="text-xs overflow-hidden">
                                    <div className="truncate">{va.person?.name}</div>
                                    <div className="text-muted-foreground">{va.language}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No character information available.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff">
          <Card>
            <CardHeader>
              <CardTitle>Staff</CardTitle>
            </CardHeader>
            <CardContent>
              {anime.staff && anime.staff.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {anime.staff.map((staffMember, index) => (
                    <Card key={index} className="border">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={staffMember.person?.images?.jpg?.image_url || ""} />
                            <AvatarFallback>
                              {staffMember.person?.name?.substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{staffMember.person?.name}</h4>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {staffMember.positions?.map((position, idx) => (
                                <Badge key={idx} variant="outline">
                                  {position}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No staff information available.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="streaming">
          <Card>
            <CardHeader>
              <CardTitle>Where to Watch</CardTitle>
            </CardHeader>
            <CardContent>
              {anime.streaming && anime.streaming.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {anime.streaming.map((stream, index) => (
                    <a
                      key={index}
                      href={stream.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="no-underline"
                    >
                      <Card className="hover:bg-accent transition-colors cursor-pointer">
                        <CardContent className="p-4 flex items-center gap-2">
                          <Globe size={20} />
                          <span>{stream.name}</span>
                        </CardContent>
                      </Card>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No streaming information available.
                </div>
              )}

              {/* External links */}
              {anime.external && anime.external.length > 0 && (
                <>
                  <h3 className="text-lg font-medium mt-6 mb-2">External Links</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {anime.external.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="no-underline"
                      >
                        <Card className="hover:bg-accent transition-colors cursor-pointer">
                          <CardContent className="p-4 flex items-center gap-2">
                            <Globe size={20} />
                            <span>{link.name}</span>
                          </CardContent>
                        </Card>
                      </a>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Trailer Section */}
      {anime.trailer?.embed_url && (
        <Card>
          <CardHeader>
            <CardTitle>Trailer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video">
              <iframe
                src={anime.trailer.embed_url}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
