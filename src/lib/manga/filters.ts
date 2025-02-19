const initialYear = 1961;
const years = Array.from(
  { length: new Date().getFullYear() - initialYear + 1 },
  (_, i) => initialYear + i,
);

export const mangaFilters = {
  year: {
    label: "Year",
    group: "basic",
    options: [
      ...years.map((year) => ({
        label: year.toString(),
        value: year.toString(),
      })),
    ],
  },
  season: {
    label: "Season",
    group: "basic",
    options: [
      { label: "Winter", value: "winter" },
      { label: "Spring", value: "spring" },
      { label: "Summer", value: "summer" },
      { label: "Fall", value: "fall" },
    ],
  },
  status: {
    label: "Status",
    group: "basic",
    options: [
      { label: "Airing", value: "Currently Airing" },
      { label: "Completed", value: "Finished Airing" },
      { label: "Upcoming", value: "Not yet aired" },
    ],
  },
  type: {
    label: "Type",
    group: "content",
    options: [
      { label: "TV", value: "TV" },
      { label: "Movie", value: "Movie" },
      { label: "OVA", value: "OVA" },
      { label: "Special", value: "Special" },
      { label: "ONA", value: "ONA" },
      { label: "Music", value: "Music" },
    ],
  },
  rating: {
    label: "Rating",
    group: "content",
    options: [
      { label: "G - All Ages", value: "G - All Ages" },
      { label: "PG - Children", value: "PG - Children" },
      {
        label: "PG-13 - Teens 13 or older",
        value: "PG-13 - Teens 13 or older",
      },
      {
        label: "R - 17+ (violence & profanity)",
        value: "R - 17+ (violence & profanity)",
      },
      { label: "R+ - Mild Nudity", value: "R+ - Mild Nudity" },
      { label: "Rx - Hentai", value: "Rx - Hentai" },
    ],
  },
  genre: {
    label: "Genre",
    group: "content",
    options: [
      { label: "Action", value: "Action" },
      { label: "Adventure", value: "Adventure" },
      { label: "Avant Garde", value: "Avant Garde" },
      { label: "Award Winning", value: "Award Winning" },
      { label: "Boys Love", value: "Boys Love" },
      { label: "Comedy", value: "Comedy" },
      { label: "Drama", value: "Drama" },
      { label: "Fantasy", value: "Fantasy" },
      { label: "Girls Love", value: "Girls Love" },
      { label: "Gourmet", value: "Gourmet" },
      { label: "Horror", value: "Horror" },
      { label: "Mystery", value: "Mystery" },
      { label: "Romance", value: "Romance" },
      { label: "Sci-Fi", value: "Sci-Fi" },
      { label: "Slice of Life", value: "Slice of Life" },
      { label: "Sports", value: "Sports" },
      { label: "Supernatural", value: "Supernatural" },
      { label: "Suspense", value: "Suspense" },
      { label: "Ecchi", value: "Ecchi" },
      { label: "Erotica", value: "Erotica" },
      { label: "Hentai", value: "Hentai" },
      { label: "Adult Cast", value: "Adult Cast" },
      { label: "Anthropomorphic", value: "Anthropomorphic" },
      { label: "CGDCT", value: "CGDCT" },
      { label: "Childcare", value: "Childcare" },
      { label: "Combat Sports", value: "Combat Sports" },
      { label: "Crossdressing", value: "Crossdressing" },
      { label: "Delinquents", value: "Delinquents" },
      { label: "Detective", value: "Detective" },
      { label: "Educational", value: "Educational" },
      { label: "Gag Humor", value: "Gag Humor" },
      { label: "Gore", value: "Gore" },
      { label: "Harem", value: "Harem" },
      { label: "High Stakes Game", value: "High Stakes Game" },
      { label: "Historical", value: "Historical" },
      { label: "Idols (Female)", value: "Idols (Female)" },
      { label: "Idols (Male)", value: "Idols (Male)" },
      { label: "Isekai", value: "Isekai" },
      { label: "Iyashikei", value: "Iyashikei" },
      { label: "Love Polygon", value: "Love Polygon" },
      { label: "Magical Sex Shift", value: "Magical Sex Shift" },
      { label: "Mahou Shoujo", value: "Mahou Shoujo" },
      { label: "Martial Arts", value: "Martial Arts" },
      { label: "Mecha", value: "Mecha" },
      { label: "Medical", value: "Medical" },
      { label: "Military", value: "Military" },
      { label: "Music", value: "Music" },
      { label: "Mythology", value: "Mythology" },
      { label: "Organized Crime", value: "Organized Crime" },
      { label: "Otaku Culture", value: "Otaku Culture" },
      { label: "Parody", value: "Parody" },
      { label: "Performing Arts", value: "Performing Arts" },
      { label: "Pets", value: "Pets" },
      { label: "Psychological", value: "Psychological" },
      { label: "Racing", value: "Racing" },
      { label: "Reincarnation", value: "Reincarnation" },
      { label: "Reverse Harem", value: "Reverse Harem" },
      { label: "Love Status Quo", value: "Love Status Quo" },
      { label: "Samurai", value: "Samurai" },
      { label: "School", value: "School" },
      { label: "Showbiz", value: "Showbiz" },
      { label: "Space", value: "Space" },
      { label: "Strategy Game", value: "Strategy Game" },
      { label: "Super Power", value: "Super Power" },
      { label: "Survival", value: "Survival" },
      { label: "Team Sports", value: "Team Sports" },
      { label: "Time Travel", value: "Time Travel" },
      { label: "Vampire", value: "Vampire" },
      { label: "Video Game", value: "Video Game" },
      { label: "Visual Arts", value: "Visual Arts" },
      { label: "Workplace", value: "Workplace" },
      { label: "Urban Fantasy", value: "Urban Fantasy" },
      { label: "Villainess", value: "Villainess" },
      { label: "Josei", value: "Josei" },
      { label: "Kids", value: "Kids" },
      { label: "Seinen", value: "Seinen" },
      { label: "Shoujo", value: "Shoujo" },
      { label: "Shounen", value: "Shounen" },
    ],
  },
  sfw: {
    label: "SFW",
    type: "radio",
    group: "display",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  },
  orderBy: {
    label: "Order By",
    type: "radio",
    group: "display",
    options: [
      { label: "None", value: "none" },
      { label: "Episodes", value: "episodes" },
      { label: "Score", value: "score" },
      { label: "Scored By", value: "scored_by" },
      { label: "Rank", value: "rank" },
      { label: "Popularity", value: "popularity" },
      { label: "Favorites", value: "favorites" },
    ],
  },
  sort: {
    label: "Sort",
    type: "radio",
    group: "display",
    options: [
      { label: "Ascending", value: "asc" },
      { label: "Descending", value: "desc" },
    ],
  },
} as const;
export type MangaFilters = typeof mangaFilters;
