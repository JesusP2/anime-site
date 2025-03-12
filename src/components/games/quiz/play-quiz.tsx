import * as React from "react";
import { QuizLayout } from "./layout";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  SkipForward,
  Clock,
  Trophy,
  CheckCircle,
  XCircle,
} from "@phosphor-icons/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function PlayQuiz() {
  const [currentQuestion, setCurrentQuestion] = React.useState(0);
  const [score, setScore] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState(30);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [selectedAnswer, setSelectedAnswer] = React.useState<number | null>(
    null,
  );
  const [isCorrect, setIsCorrect] = React.useState<boolean | null>(null);

  // Mock quiz data
  const quiz = {
    title: "Popular 2010s Anime Themes",
    creator: "AnimeGuru",
    difficulty: "Medium",
    questions: [
      {
        id: 1,
        audioUrl: "#", // This would be a real audio URL
        correctAnime: 2,
        options: [
          { id: 1, title: "Attack on Titan" },
          { id: 2, title: "Demon Slayer" },
          { id: 3, title: "My Hero Academia" },
          { id: 4, title: "One Punch Man" },
        ],
      },
      {
        id: 2,
        audioUrl: "#",
        correctAnime: 3,
        options: [
          { id: 1, title: "Hunter x Hunter" },
          { id: 2, title: "Naruto Shippuden" },
          { id: 3, title: "Jujutsu Kaisen" },
          { id: 4, title: "Tokyo Revengers" },
        ],
      },
      // Additional questions would be here
    ],
  };

  // Number of questions in the quiz
  const totalQuestions = quiz.questions.length;

  React.useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isPlaying && timeLeft > 0 && selectedAnswer === null) {
      timer = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && selectedAnswer === null) {
      handleAnswer(-1); // Time's up
    }

    return () => clearTimeout(timer);
  }, [isPlaying, timeLeft, selectedAnswer]);

  const handlePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleAnswer = (optionId: number) => {
    setSelectedAnswer(optionId);
    const currentQ = quiz.questions[currentQuestion];

    if (optionId === currentQ?.correctAnime) {
      setIsCorrect(true);
      // Calculate score based on time left
      const pointsEarned = Math.max(10, 10 + timeLeft);
      setScore((prev) => prev + pointsEarned);
    } else {
      setIsCorrect(false);
    }

    // Pause the audio
    setIsPlaying(false);
  };

  const goToNextQuestion = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setTimeLeft(30);
      setIsPlaying(false);
    } else {
      // End of quiz
      console.log("Quiz completed!");
    }
  };

  const currentQuizQuestion = quiz.questions[currentQuestion];

  return (
    <QuizLayout title={quiz.title}>
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              Question {currentQuestion + 1}/{totalQuestions}
            </Badge>
            <Badge>{quiz.difficulty}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="text-yellow-500" />
            <span className="font-bold">{score} pts</span>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="flex justify-between items-center">
              <span>Guess the Anime</span>
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-orange-500" />
                <span
                  className={`font-mono ${timeLeft < 10 ? "text-red-500" : ""}`}
                >
                  {timeLeft}s
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Progress value={(timeLeft / 30) * 100} className="h-2" />
            </div>

            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6 flex items-center justify-center">
              <div className="text-center">
                <Button
                  size="lg"
                  className="rounded-full w-16 h-16 mb-2"
                  onClick={handlePlayPause}
                  disabled={selectedAnswer !== null}
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8" />
                  ) : (
                    <Play className="w-8 h-8" />
                  )}
                </Button>
                <p className="text-sm">
                  Click to {isPlaying ? "pause" : "play"} the opening
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentQuizQuestion?.options.map((option) => (
                <Button
                  key={option.id}
                  variant={
                    selectedAnswer === null
                      ? "outline"
                      : selectedAnswer === option.id
                        ? isCorrect
                          ? "default"
                          : "destructive"
                        : option.id === currentQuizQuestion?.correctAnime &&
                            selectedAnswer !== null
                          ? "default"
                          : "outline"
                  }
                  className={`h-auto py-6 justify-start text-lg ${
                    selectedAnswer !== null && "cursor-default"
                  }`}
                  onClick={() => {
                    if (selectedAnswer === null) {
                      handleAnswer(option.id);
                    }
                  }}
                >
                  {selectedAnswer !== null &&
                    (option.id === currentQuizQuestion.correctAnime ? (
                      <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                    ) : selectedAnswer === option.id ? (
                      <XCircle className="w-5 h-5 mr-2 text-red-500" />
                    ) : null)}
                  {option.title}
                </Button>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            {selectedAnswer !== null && (
              <Button className="w-full" onClick={goToNextQuestion}>
                {currentQuestion < totalQuestions - 1 ? (
                  <>
                    <SkipForward className="mr-2 w-4 h-4" />
                    Next Question
                  </>
                ) : (
                  "See Results"
                )}
              </Button>
            )}
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Quiz Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-3">
              <Avatar>
                <AvatarImage src="" />
                <AvatarFallback>AG</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">Created by {quiz.creator}</p>
                <p className="text-sm text-gray-500">
                  Difficulty: {quiz.difficulty}
                </p>
              </div>
            </div>
            <Progress
              value={
                ((currentQuestion + (selectedAnswer !== null ? 1 : 0)) /
                  totalQuestions) *
                100
              }
              className="h-2"
            />
            <p className="text-center text-sm mt-2">
              {currentQuestion + (selectedAnswer !== null ? 1 : 0)} of{" "}
              {totalQuestions} questions
            </p>
          </CardContent>
        </Card>
      </div>
    </QuizLayout>
  );
}
