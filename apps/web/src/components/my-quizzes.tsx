import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { actions } from "astro:actions";
import type { getQuizzes } from "@/lib/games/quiz/queries";
import type { Ok } from "@/lib/result";
import { useState } from "react";
import { PlusCircle } from "@phosphor-icons/react";

type Props =
  ReturnType<typeof getQuizzes> extends Promise<infer T>
    ? T extends Ok<infer U>
      ? U
      : never
    : never;

export function MyQuizzes({ quizzes }: { quizzes: Props }) {
  const [_quizzes, setQuizzes] = useState(quizzes);
  async function handleDelete(
    e: React.FormEvent<HTMLFormElement>,
    quizId: string,
  ) {
    e.preventDefault();
    if (!quizId) return;
    setQuizzes(_quizzes.filter((quiz) => quiz.id !== quizId));
    try {
      const res = await actions.quizzes.deleteQuiz({
        quizId,
      });
      if (res.error) {
        console.error(res.error);
        return;
      }
    } catch (error) {
      console.error("Error deleting quiz:", error);
    }
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Quizzes</h1>
        <a
          className={buttonVariants({ variant: "outline" })}
          href="/themes/quiz/create"
        >
          <PlusCircle className="mr-2 w-5 h-5" />
          Create New Quiz
        </a>
      </div>
      {!_quizzes.length ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          You haven't created any quizzes yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {_quizzes.map((quiz) => (
            <Card>
              <CardHeader>
                <CardTitle>{quiz.quizTitle}</CardTitle>
                <CardDescription>
                  {quiz.description || "No description provided."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    <strong>Difficulty:</strong>{" "}
                    <span className="capitalize">{quiz.difficulty}</span>
                  </p>
                  <p>
                    <strong>Visibility:</strong>{" "}
                    {quiz.public ? "Public" : "Private"}
                  </p>
                  <p>
                    <strong>Created:</strong>{" "}
                    {quiz.createdAt &&
                      new Date(quiz.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <form method="POST" onSubmit={(e) => handleDelete(e, quiz.id)}>
                  <Button type="submit" variant="destructive">
                    Delete
                  </Button>
                </form>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
