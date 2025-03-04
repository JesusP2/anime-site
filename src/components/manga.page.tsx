import type { EntityStatus, FullMangaRecord } from "@/lib/types";
import type { User } from "better-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, PlayCircle, Star, TrendingUp, Users } from "lucide-react";
import { StatusDropdown } from "./status-dropdown";
import { useState } from "react";

type Props = {
  manga: FullMangaRecord & { entityStatus?: EntityStatus; embedding: number[] };
  user: User | null;
};

export function MangaDetailsPage({ manga, user }: Props) {
  const [status, setStatus] = useState(manga.entityStatus as EntityStatus);
  const getMainTitle = () => {
    const mangaTitle =
      manga.titles?.find((title) => title.type === "English")?.title ||
      manga.titles?.find((title) => title.type === "Default")?.title;
    return mangaTitle;
  };
  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Hero Section - Using flex instead of grid for better control */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Anime Image - with fixed width constraints */}
        <div className="w-2/3 lg:w-[320px] flex-shrink-0 mx-auto">
          <Card>
            <CardContent className="p-4">
              <div className="aspect-[2/3] relative overflow-hidden rounded-md">
                <StatusDropdown
                  data={manga}
                  status={status}
                  setStatus={setStatus}
                  className="absolute top-4 right-4 lg:hidden"
                  entityType="MANGA"
                  user={user}
                />
                <img
                  src={manga.images?.jpg?.large_image_url || "/placeholder-anime.jpg"}
                  alt={getMainTitle()}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="mt-4 space-y-2 hidden lg:block">
                <StatusDropdown
                  data={manga}
                  status={status}
                  setStatus={setStatus}
                  entityType="MANGA"
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
                  <CardTitle className="text-3xl font-bold">{getMainTitle()}</CardTitle>
                  {manga.titles?.filter(t => ['English', 'Default', 'Japanese'].includes(t.type)).map((title, index) => (
                    <CardDescription key={index} className="text-lg">
                      {title.title} {title.type && <span className="text-xs">({title.type})</span>}
                    </CardDescription>
                  ))}
                </div>
                <div className="flex items-center space-x-4">
                  {manga.score && (
                    <div className="text-center">
                      <div className="flex items-center">
                        <Star className="text-yellow-500 mr-1" size={20} />
                        <span className="text-xl font-bold">{manga.score.toFixed(2)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {manga.scored_by ? `${manga.scored_by.toLocaleString()} users` : "No ratings"}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {manga.type && <Badge>{manga.type}</Badge>}
                {manga.status && <Badge variant="outline">{manga.status}</Badge>}
              </div>

              {/* Stats Grid - Added rank and popularity */}
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                {manga.chapters && (
                  <div className="flex items-center">
                    <PlayCircle className="mr-2" size={16} />
                    <span>{manga.chapters} episodes</span>
                  </div>
                )}
                {manga.volumes && (
                  <div className="flex items-center">
                    <PlayCircle className="mr-2" size={16} />
                    <span>{manga.volumes} episodes</span>
                  </div>
                )}
                {manga.members && (
                  <div className="flex items-center">
                    <Users className="mr-2" size={16} />
                    <span>{manga.members.toLocaleString()} members</span>
                  </div>
                )}
                {manga.rank && (
                  <div className="flex items-center">
                    <Award className="mr-2" size={16} />
                    <span>Ranked #{manga.rank.toLocaleString()}</span>
                  </div>
                )}
                {manga.popularity && (
                  <div className="flex items-center">
                    <TrendingUp className="mr-2" size={16} />
                    <span>Popularity #{manga.popularity.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-medium mb-2">Synopsis</h3>
                <p className="text-sm leading-relaxed">
                  {manga.synopsis || "No synopsis available."}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {manga.genres?.map((genre) => (
                  <Badge key={genre.mal_id} variant="secondary">
                    {genre.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Background */}
          {manga.background && (
            <div>
              <h3 className="text-lg font-medium mb-2">Background</h3>
              <p className="text-sm">{manga.background}</p>
            </div>
          )}

          {/* Themes & Demographics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {manga.themes && manga.themes.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2">Themes</h3>
                <div className="flex flex-wrap gap-2">
                  {manga.themes.map((theme) => (
                    <Badge key={theme.mal_id} variant="outline">
                      {theme.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {manga.demographics && manga.demographics.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2">Demographics</h3>
                <div className="flex flex-wrap gap-2">
                  {manga.demographics.map((demographic) => (
                    <Badge key={demographic.mal_id} variant="outline">
                      {demographic.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
