export type QuizDifficulty = "easy" | "medium" | "hard";
export type QuizMode = "solo" | "multiplayer";

export type AnimeScene = {
  id: number;
  title: string;
  animeId: number;
  animeTitle: string;
  audioUrl: string;
};

export type QuizQuestion = {
  id: number;
  audioUrl: string;
  correctAnime: number;
  options: {
    id: number;
    title: string;
  }[];
};

export type Quiz = {
  id: string;
  title: string;
  description?: string;
  creatorId: string;
  creatorName: string;
  difficulty: QuizDifficulty;
  isPublic: boolean;
  plays: number;
  rating: number;
  questions: QuizQuestion[];
  createdAt: string;
};

export type QuizResult = {
  id: string;
  quizId: string;
  userId?: string;
  score: number;
  totalPossible: number;
  correctAnswers: number;
  totalQuestions: number;
  timeTaken: number; // seconds
  completedAt: string;
  questionResults: {
    questionId: number;
    correct: boolean;
    timeTaken: number; // seconds
  }[];
};
