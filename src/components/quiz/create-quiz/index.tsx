import * as React from "react";
import { InfoSection } from "./info-section";
import { SongsSection } from "./songs-section";
import { ReviewSection } from "./review-section";
import type { z } from "astro:content";
import type {
  CreateQuiz,
  createQuizInfoSectionSchema,
  SongSelectionSection,
} from "@/lib/schemas";
import { actions } from "astro:actions";
import { navigate } from "astro:transitions/client";

const totalSteps = 3;
export function CreateQuiz() {
  const [values, setValues] = React.useState<CreateQuiz>({
    title: "",
    description: "",
    public: false,
    isRandom: false,
    difficulty: "custom",
    songs: [],
  });
  const [currentStep, setCurrentStep] = React.useState(1);

  async function onInfoSectionCompleted(
    values: z.infer<typeof createQuizInfoSectionSchema>,
  ) {
    if (values.isRandom) {
      setValues(() => {
        return {
          title: values.title,
          description: values.description,
          public: values.public,
          isRandom: true,
          themeType: values.themeType,
          difficulty: values.difficulty,
          themeCount: values.themeCount,
        };
      });
      setCurrentStep(3);
    } else if (!values.isRandom) {
      setValues((prev) => {
        return {
          title: values.title,
          description: values.description,
          public: values.public,
          isRandom: false,
          difficulty: "custom",
          songs: prev.isRandom ? [] : prev.songs,
        };
      });
      setCurrentStep(2);
    }
  }

  function onSongsSectionCompleted(songs: SongSelectionSection["songs"]) {
    setValues((prev) => ({ ...prev, songs }));
    setCurrentStep(3);
  }

  async function onReviewSectionCompleted() {
    try {
      const res = await actions.games.createQuiz(values);
      if (res.error) {
        console.error(res.error);
        return;
      }

      navigate(`/themes/quiz/${res.data}`);
    } catch (error) {
      console.error("Error creating quiz:", error);
    }
  }

  return (
    <>
      <div className="flex items-center justify-center mb-6 mx-auto w-full max-w-[15rem]">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <React.Fragment key={index}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${index + 1 === currentStep
                ? "bg-primary text-primary-foreground"
                : index + 1 < currentStep
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
                }`}
            >
              {index + 1}
            </div>
            {index < totalSteps - 1 && (
              <div
                className={`h-1 flex-1 mx-2 ${index + 1 < currentStep ? "bg-primary" : "bg-muted"
                  }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
      <InfoSection
        hide={currentStep !== 1}
        onCompleted={onInfoSectionCompleted}
      />
      <SongsSection
        hide={currentStep !== 2}
        onCompleted={onSongsSectionCompleted}
        onBack={() => setCurrentStep(1)}
      />
      <ReviewSection
        hide={currentStep !== 3}
        onCompleted={onReviewSectionCompleted}
        onBack={() => setCurrentStep(values.isRandom ? 1 : 2)}
        quizData={values}
      />
    </>
  );
}
