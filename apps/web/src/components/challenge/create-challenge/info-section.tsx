import { createChallengeInfoSectionSchema } from "@/lib/schemas";
import { useForm } from "@tanstack/react-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Globe, ArrowRight } from "@phosphor-icons/react";
import { Switch } from "@/components/ui/switch";
import { FieldInfo } from "@/components/field-info";
import type { z } from "astro:content";
import { JollyNumberField } from "@/components/ui/jolly/numberfield";

export function InfoSection({
  onCompleted,
  hide,
}: {
  onCompleted: (values: z.infer<typeof createChallengeInfoSectionSchema>) => void;
  hide: boolean;
}) {
  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      public: false,
      isRandom: false,
      themeType: "OP",
      difficulty: "custom",
      themeCount: 10,
    } as z.infer<typeof createChallengeInfoSectionSchema>,
    validators: {
      onSubmit: createChallengeInfoSectionSchema,
    },
    onSubmit: ({ value }) => {
      onCompleted(value as any);
    },
  });

  if (hide) return null;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit(e);
      }}
    >
      <Card className="w-[25rem] mx-auto">
        <CardHeader>
          <CardTitle>Challenge Details</CardTitle>
          <CardDescription>
            Enter the basic information about your challenge
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 w-96">
          <form.Field
            name="title"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor="title">Challenge Title</Label>
                <Input
                  id="title"
                  placeholder="Enter a catchy title for your challenge"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldInfo field={field} />
              </div>
            )}
          />

          <form.Field
            name="description"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what your challenge is about"
                  value={field.state.value}
                  className="min-h-[100px]"
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldInfo field={field} />
              </div>
            )}
          />
          <form.Field
            name="isRandom"
            children={(field) => (
              <>
                <div className="space-x-2 items-center flex">
                  <Label htmlFor="isRandom">Random Challenge</Label>
                  <Switch
                    id="isRandom"
                    checked={field.state.value}
                    onCheckedChange={(value) => {
                      if (value) {
                        form.setFieldValue("difficulty", "easy");
                      } else {
                        form.setFieldValue("difficulty", "custom");
                      }
                      field.handleChange(value);
                    }}
                    className="mt-0"
                  />
                  <FieldInfo field={field} />
                </div>
                {field.state.value && (
                  <>
                    <form.Field
                      name="themeType"
                      children={(field) => (
                        <div className="space-y-2">
                          <Label htmlFor="themeType">Challenge Type</Label>
                          <RadioGroup
                            value={field.state.value}
                            onValueChange={field.handleChange as any}
                            className="space-y-2"
                          >
                            <div className="flex space-x-4">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="OP" id="opening" />
                                <Label htmlFor="opening">Opening</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="ED" id="ending" />
                                <Label htmlFor="ending">Ending</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="ALL" id="all" />
                                <Label htmlFor="all">All</Label>
                              </div>
                            </div>
                          </RadioGroup>
                          <FieldInfo field={field} />
                        </div>
                      )}
                    />
                    <form.Field
                      name="difficulty"
                      children={(field) => (
                        <div className="space-y-2">
                          <Label>Difficulty</Label>
                          <RadioGroup
                            value={field.state.value}
                            onValueChange={field.handleChange as any}
                            className="space-y-2"
                          >
                            <div className="flex space-x-4">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="easy" id="easy" />
                                <Label htmlFor="easy">Easy</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="medium" id="medium" />
                                <Label htmlFor="medium">Medium</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="hard" id="hard" />
                                <Label htmlFor="hard">Hard</Label>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="impossible"
                                id="impossible"
                              />
                              <Label htmlFor="impossible">Impossible</Label>
                            </div>
                          </RadioGroup>
                          <FieldInfo field={field} />
                        </div>
                      )}
                    />

                    <form.Field
                      name="themeCount"
                      children={(field) => (
                        <JollyNumberField
                          className="w-24"
                          label="Theme Count"
                          minValue={1}
                          maxValue={100}
                          value={field.state.value}
                          onChange={field.handleChange}
                        />
                      )}
                    />
                  </>
                )}
              </>
            )}
          />
          <form.Field
            name="public"
            children={(field) => (
              <div className="flex items-center space-x-2">
                <Switch
                  id="public"
                  checked={field.state.value}
                  onCheckedChange={field.handleChange}
                />
                <Label htmlFor="public" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Make challenge public
                </Label>
                <FieldInfo field={field} />
              </div>
            )}
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" className="flex items-center">
            Next Step
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
