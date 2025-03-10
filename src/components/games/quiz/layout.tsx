import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MusicNote, GameController } from "@phosphor-icons/react";

type OpeningQuizLayoutProps = {
  title: string;
  children: React.ReactNode;
};

export function OpeningQuizLayout({ title, children }: OpeningQuizLayoutProps) {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
          <MusicNote weight="fill" className="text-purple-600 dark:text-purple-300 w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold">{title}</h1>
      </div>
      
      {children}
    </div>
  );
} 