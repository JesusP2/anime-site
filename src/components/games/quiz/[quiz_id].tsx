type QuizInfo = {
    title: string | undefined;
    difficulty: string | undefined;
    public: boolean | undefined;
    createdAt: Date | null | undefined;
    themes: {
        id: string | null;
        title: string | null;
        animeTitle: string;
        url: string[];
    }[];
}
export function Quiz(props: QuizInfo) {
  return 
}
