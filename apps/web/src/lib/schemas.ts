import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least  8 characters long")
  .max(255, "password cannot be longer than  255 characters");
export const signinSchema = z.object({
  username: z.string().min(3, "Username must be at least  3 character long."),
  password: passwordSchema,
});

export const signupSchema = signinSchema;
export const emailVerificationSchema = z.object({
  email: z.string().email().max(255),
});

export const profileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least  3 character long.")
    .max(255),
  email: z.string().email().max(255).nullish(),
  avatar: z
    .instanceof(File)
    .refine(
      (data) => data.size < 1 * 1024 * 1024,
      "Exceeded file size limit (1MB).",
    )
    .nullish(),
});

export const codeSchema = z.object({
  code: z.string().length(6),
});

export const changePasswordSchema = z.object({
  currentPassword: passwordSchema,
  newPassword: passwordSchema,
});

export const resetTokenSchema = z.object({
  email: z.string().email().max(255),
});

export const validateResetTokenSchema = z.object({
  password: passwordSchema,
  token: z.string().max(255),
});

export const magicLinkTokenSchema = z.object({
  token: z.string().max(255),
});

export const createQuizInfoSectionBaseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long."),
  description: z.string(),
  public: z.boolean(),
});

const difficultySchema = z.enum(["easy", "medium", "hard", "impossible"]);
const themeTypeSchema = z.enum(["OP", "ED", "ALL"]);
export const createQuizInfoSectionSchema = z.discriminatedUnion("isRandom", [
  z
    .object({
      isRandom: z.literal(true),
      themeType: themeTypeSchema,
      difficulty: difficultySchema,
      themeCount: z
        .number()
        .min(5, "Theme count must be at least 5")
        .max(100, "Theme count cannot exceeed 100"),
    })
    .merge(createQuizInfoSectionBaseSchema),
  z
    .object({
      isRandom: z.literal(false),
      difficulty: z.literal("custom"),
    })
    .merge(createQuizInfoSectionBaseSchema),
]);

export const createQuizSongSelectionSectionSchema = z.object({
  songs: z
    .array(
      z.object({
        id: z.string().ulid(),
        title: z.string(),
        animeTitle: z.string(),
      }),
    )
    .min(5, "You must select at least 5 songs."),
});

export type SongSelectionSection = z.infer<
  typeof createQuizSongSelectionSectionSchema
>;

export const createQuizSchema = z.discriminatedUnion("isRandom", [
  z
    .object({
      isRandom: z.literal(true),
      creatorId: z.string().ulid().nullish(),
      difficulty: difficultySchema,
      themeType: themeTypeSchema,
      themeCount: z
        .number()
        .min(5, "Theme count must be at least 5")
        .max(100, "Theme count cannot exceeed 100"),
    })
    .merge(createQuizInfoSectionBaseSchema),
  z
    .object({
      isRandom: z.literal(false),
      creatorId: z.string().ulid().nullish(),
      difficulty: z.literal("custom"),
    })
    .merge(createQuizInfoSectionBaseSchema)
    .merge(createQuizSongSelectionSectionSchema),
]);
export type CreateQuiz = z.infer<typeof createQuizSchema>;
