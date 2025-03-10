export type OpeningQuizDifficulty = "easy" | "medium" | "hard";

export type OpeningQuizMode = "solo" | "multiplayer";

export type AnimeOpening = {
  id: number;
  title: string;
  animeId: number;
  animeTitle: string;
  audioUrl: string;
};

export type OpeningQuizQuestion = {
  id: number;
  audioUrl: string;
  correctAnime: number;
  options: {
    id: number;
    title: string;
  }[];
};

export type OpeningQuizQuiz = {
  id: string;
  title: string;
  description?: string;
  creatorId: string;
  creatorName: string;
  difficulty: OpeningQuizDifficulty;
  isPublic: boolean;
  plays: number;
  rating: number;
  questions: OpeningQuizQuestion[];
  createdAt: string;
};

export type OpeningQuizResult = {
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
