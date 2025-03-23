import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MinusCircle, ArrowRight, ArrowLeft } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import {
  createQuizSongSelectionSectionSchema,
  type SongSelectionSection,
} from "@/lib/schemas";
import { useForm } from "@tanstack/react-form";
import { SongAutocomplete } from "@/components/song-autocomplete";
import { FieldInfo } from "@/components/field-info";

export function SongsSection({
  onCompleted,
  onBack,
  hide,
}: {
  onCompleted: (songs: SongSelectionSection["songs"]) => void;
  onBack: () => void;
  hide: boolean;
}) {
  const form = useForm({
    defaultValues: {
      songs: [] as SongSelectionSection["songs"],
    },
    validators: {
      onSubmit: createQuizSongSelectionSectionSchema,
    },
    onSubmit: ({ value }) => {
      onCompleted(value.songs);
    },
  });

  if (hide) return null;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit(e);
      }}
    >
      <Card className="w-[25rem] mx-auto">
        <CardHeader>
          <CardTitle>Add Anime Themes</CardTitle>
          <CardDescription>
            Add at least 5 openings to your quiz (maximum 20)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 w-[25rem]">
          <form.Field
            name="songs"
            children={(field) => (
              <>
                <SongAutocomplete
                  ignoreThemes={field.state.value}
                  onSelectedValueChange={({ key, value, label }) => {
                    if (field.state.value.some((song) => song.id === key)) {
                      return;
                    }
                    const values = [
                      ...field.state.value,
                      {
                        id: key,
                        title: value,
                        animeTitle: label,
                      },
                    ];
                    field.handleChange(values);
                  }}
                />
                <FieldInfo field={field} />

                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">
                    Selected Themes ({field.state.value.length}/100)
                  </h3>
                  <ul className="space-y-2">
                    {field.state.value.map((song, index) => (
                      <li
                        key={song.id}
                        className="flex items-center justify-between p-3 border rounded-md"
                      >
                        <div className="flex gap-2">
                          <Badge
                            variant="outline"
                            className="shrink-0 h-6 mt-1"
                          >
                            {index + 1}
                          </Badge>
                          <div>
                            <span className="font-medium">{song.title}</span>
                            <p className="text-sm text-gray-500">
                              {song.animeTitle}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newSongs = field.state.value.filter(
                              (song) => song.id !== song.id,
                            );
                            form.setFieldValue("songs", newSongs);
                          }}
                        >
                          <MinusCircle className="w-5 h-5 text-red-500" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            className="flex items-center"
            onClick={onBack}
            type="button"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Previous
          </Button>
          <Button className="flex items-center">
            Create quiz
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
