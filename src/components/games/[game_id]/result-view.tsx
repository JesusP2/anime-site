import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy } from "@phosphor-icons/react";
import { Table } from "lucide-react";
import { TableBody, TableHeader } from "react-aria-components";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";

export function ResultView({
  quizTitle,
  results,
}: {
  quizTitle: string;
  results: Array<{ id: string; name: string; score: number }>;
}) {
  // Sort results by score (highest first)
  const sortedResults = [...results].sort((a, b) => b.score - a.score);

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>{quizTitle} - Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Winner */}
          {sortedResults.length > 0 && (
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-4 bg-yellow-100 rounded-full mb-2">
                <Trophy className="w-8 h-8 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold mb-1">
                {sortedResults[0]?.name} Wins!
              </h2>
              <p className="text-lg font-medium">
                {sortedResults[0]?.score} points
              </p>
            </div>
          )}

          {/* All Results */}
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Rank</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedResults.map((player, index) => (
                  <TableRow key={player.id}>
                    <TableCell>
                      {index === 0 ? (
                        <span className="font-bold text-yellow-600">1st</span>
                      ) : index === 1 ? (
                        <span className="font-medium text-gray-500">2nd</span>
                      ) : index === 2 ? (
                        <span className="font-medium text-amber-700">3rd</span>
                      ) : (
                        `${index + 1}th`
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{player.name}</div>
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {player.score}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Play Again Button */}
          <div className="flex justify-center mt-6">
            <Button asChild>
              <a href="/themes/quiz">Play Again</a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
