import { QuizLayout } from "./layout";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  ArrowClockwise, 
  ShareNetwork, 
  Star,
  House
} from "@phosphor-icons/react";

export function QuizResults() {
  // Mock results data
  const results = {
    quizTitle: "Popular 2010s Anime Themes",
    creator: "AnimeGuru",
    score: 780,
    totalPossible: 1000,
    correctAnswers: 8,
    totalQuestions: 10,
    timeTaken: "2:45",
    questions: [
      { 
        id: 1,
        anime: "Demon Slayer",
        opening: "Gurenge",
        correct: true,
        timeTaken: 12
      },
      { 
        id: 2,
        anime: "Jujutsu Kaisen",
        opening: "Kaikai Kitan",
        correct: true,
        timeTaken: 8
      },
      { 
        id: 3,
        anime: "Attack on Titan",
        opening: "Guren no Yumiya",
        correct: false,
        timeTaken: 25
      },
      // Additional questions would be here
    ]
  };
  
  const accuracy = (results.correctAnswers / results.totalQuestions) * 100;
  
  return (
    <QuizLayout title="Quiz Results">
      <div className="max-w-3xl mx-auto">
        <Card className="mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-24 flex items-center justify-center">
            <Trophy className="text-yellow-300 w-16 h-16" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-center text-2xl">{results.quizTitle}</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-4xl font-bold mb-2">
              {results.score} <span className="text-base text-gray-500">/ {results.totalPossible}</span>
            </div>
            <p className="text-gray-500 mb-4">
              {results.correctAnswers} of {results.totalQuestions} correct • {results.timeTaken} mins
            </p>
            
            <div className="flex justify-center space-x-6 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{Math.round(accuracy)}%</div>
                <p className="text-xs text-gray-500">Accuracy</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{Math.round(results.score / results.totalQuestions)}</div>
                <p className="text-xs text-gray-500">Avg. Points</p>
              </div>
            </div>
            
            <div className="flex justify-center gap-4">
              <Button variant="outline" size="sm">
                <ShareNetwork className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <ArrowClockwise className="w-4 h-4 mr-2" />
                Play Again
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Question Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {results.questions.map((question, index) => (
                <li key={question.id} className="border rounded-md p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">Question {index + 1}</span>
                    <span className={question.correct ? "text-green-500" : "text-red-500"}>
                      {question.correct ? "+100" : "+0"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <div>
                      <p className="font-medium">{question.anime}</p>
                      <p className="text-gray-500">{question.opening}</p>
                    </div>
                    <div className="flex items-center">
                      {question.correct ? (
                        <div className="text-green-500 flex items-center">
                          <Star className="w-4 h-4 mr-1" weight="fill" />
                          {question.timeTaken}s
                        </div>
                      ) : (
                        <div className="text-red-500">Incorrect</div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        <div className="flex justify-center gap-4">
          <Button>
            <ArrowClockwise className="w-5 h-5 mr-2" />
            Try Another Quiz
          </Button>
          <Button variant="outline">
            <House className="w-5 h-5 mr-2" />
            Return to Home
          </Button>
        </div>
      </div>
    </QuizLayout>
  );
} 
