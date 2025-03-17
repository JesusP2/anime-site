import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Check,
  Globe,
  Lock,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import type { CreateQuiz, SongSelectionSection } from "@/lib/schemas";

const getDifficultyLabel = (difficulty: string) => {
  switch (difficulty) {
    case "easy":
      return "Easy";
    case "medium":
      return "Medium";
    case "hard":
      return "Hard";
    case "impossible":
      return "Impossible";
    case "custom":
      return "Custom";
    default:
      return difficulty;
  }
};
export function ReviewSection({
  onCompleted,
  onBack,
  hide,
  quizData,
}: {
  onCompleted: () => void;
  onBack: () => void;
  hide: boolean;
  quizData: CreateQuiz;
}) {
  if (hide) return null;
  return (
    <Card className="w-[25rem] mx-auto">
      <CardHeader>
        <CardTitle>Review Your Quiz</CardTitle>
        <CardDescription>
          Confirm the details of your quiz before creating it
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-2">Quiz Information</h3>
          <div className="space-y-3 border rounded-md p-4">
            <div>
              <span className="text-sm text-muted-foreground">Title:</span>
              <p className="font-medium">{quizData.title}</p>
            </div>

            {quizData.description && (
              <div>
                <span className="text-sm text-muted-foreground">
                  Description:
                </span>
                <p className="text-sm">{quizData.description}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                {getDifficultyLabel(quizData.difficulty)}
              </Badge>
              <Badge
                variant="outline"
                className={
                  quizData.public
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                }
              >
                {quizData.public ? (
                  <>
                    <Globe className="w-3 h-3 mr-1" /> Public
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3 mr-1" /> Private
                  </>
                )}
              </Badge>
              {quizData.isRandom && (
                <Badge
                  variant="outline"
                  className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                >
                  Random Quiz
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          className="flex items-center"
          onClick={onBack}
          type="button"
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back
        </Button>
        <Button className="flex items-center" onClick={onCompleted}>
          Create Quiz
          <Check className="ml-2 w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
