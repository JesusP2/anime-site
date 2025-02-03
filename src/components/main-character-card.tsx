import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";

export function MainCharacterCard({ character, role }: { character: any; role: string }) {
  return (
    <Card key={character.name} className="overflow-hidden rounded-md max-w-[350px]">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <img src={character?.images?.webp?.small_image_url} alt={character?.name} className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <div>
              <h3 className="font-semibold text-lg">{character.name}</h3>
              <Badge variant="secondary">
                {role}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
