import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";

export function KeyStaffCard({ staff, positions }: { staff: any; positions?: string[] }) {
  return (
    <Card key={staff.name} className="overflow-hidden rounded-md max-w-[350px]">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <img src={staff?.images?.jpg?.image_url} alt={staff?.name} className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <div>
              <h3 className="font-semibold text-lg">{staff.name}</h3>
              <p className="text-sm text-muted-foreground">{staff.role}</p>
            </div>
            <p className="text-sm">{staff.description}</p>
            <div className="flex flex-wrap gap-2">
              {positions?.slice(0, 2).map((position) => (
                <Badge key={position} variant="secondary">
                  {position}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
