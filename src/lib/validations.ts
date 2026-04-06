import { z } from "zod";
import { avatarColorOptions } from "@/lib/avatar";

export const workoutTypeSchema = z.enum([
  "STRENGTH",
  "CARDIO",
  "MOBILITY",
  "REST",
  "OTHER",
]);

export const entrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  workoutType: workoutTypeSchema,
  workoutDuration: z.number().int().nonnegative(),
  perceivedExertion: z.number().int().min(1).max(10),
  sorenessLevel: z.number().int().min(1).max(10),
  sleepDuration: z.number().positive(),
  sleepQuality: z.number().int().min(1).max(10),
  energyLevel: z.number().int().min(1).max(10),
  notes: z.string().max(5000).optional().nullable(),
});

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.email(),
  password: z.string().min(8).max(100),
});

export const profileSchema = z.object({
  name: z.string().min(2).max(100),
  avatarColor: z.enum(avatarColorOptions).nullable().optional(),
  age: z.number().int().min(13).max(120).nullable().optional(),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).nullable().optional(),
  weight: z.number().positive().max(500).nullable().optional(),
  height: z.number().positive().max(300).nullable().optional(),
  trainingLevel: z.enum(["beginner", "intermediate", "advanced"]).nullable().optional(),
  trainingGoal: z
    .enum(["strength", "endurance", "rehab", "general_fitness"])
    .nullable()
    .optional(),
  injuryNotes: z.string().max(2000).nullable().optional(),
});

export type EntryInput = z.infer<typeof entrySchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
