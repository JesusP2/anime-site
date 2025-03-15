import * as React from "react";
import { QuizLayout } from "../layout";
import { InfoSection } from "./info-section";
import { SongsSection } from "./songs-section";
import type { z } from "astro:content";
import type { createQuizInfoSectionSchema, SongSelectionSection } from "@/lib/schemas";
import { actions } from "astro:actions";

const totalSteps = 2;
export function CreateQuiz() {
  const [values, setValues] = React.useState({
    title: "",
    description: "",
    difficulty: "medium",
    public: false,
    songs: [] as SongSelectionSection['songs'],
  });
  const [currentStep, setCurrentStep] = React.useState(1);

  function onInfoSectionCompleted(values: z.infer<typeof createQuizInfoSectionSchema>) {
    setValues(prev => ({ ...prev, ...values }));
    setCurrentStep(2);
  }

  async function onSongsSectionCompleted(songs: SongSelectionSection['songs']) {
    const _values = { ...values, songs }
    setValues(_values);
    setCurrentStep(3);
    const id = await actions.games.createQuiz(_values as any)
    console.log(id)
  }
  return (
    <QuizLayout title="Create a Quiz">
      <div className="flex items-center justify-center mb-6 w-full max-w-[30rem]">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <React.Fragment key={index}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${index + 1 === currentStep
                ? 'bg-primary text-primary-foreground'
                : index + 1 < currentStep
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground'
                }`}
            >
              {index + 1}
            </div>
            {index < totalSteps - 1 && (
              <div
                className={`h-1 flex-1 mx-2 ${index + 1 < currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
      <InfoSection hide={currentStep !== 1} onCompleted={onInfoSectionCompleted} />
      <SongsSection hide={currentStep !== 2} onCompleted={onSongsSectionCompleted} onBack={() => setCurrentStep(1)} />
    </QuizLayout>
  );
}
