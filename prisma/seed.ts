import { PrismaClient, WorkoutType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const demoEmail = "demo@example.com";
const demoPassword = "password123";

type EntryTemplate = {
  workoutType: WorkoutType;
  workoutDuration: number;
  perceivedExertion: number;
  sorenessLevel: number;
  sleepDuration: number;
  sleepQuality: number;
  energyLevel: number;
  notes: string;
};

const entryTemplates: EntryTemplate[] = [
  {
    workoutType: "STRENGTH",
    workoutDuration: 55,
    perceivedExertion: 8,
    sorenessLevel: 6,
    sleepDuration: 7.3,
    sleepQuality: 7,
    energyLevel: 7,
    notes: "Lower body session. Quads felt heavy in final set.",
  },
  {
    workoutType: "CARDIO",
    workoutDuration: 40,
    perceivedExertion: 6,
    sorenessLevel: 4,
    sleepDuration: 7.9,
    sleepQuality: 8,
    energyLevel: 8,
    notes: "Zone 2 run with steady breathing throughout.",
  },
  {
    workoutType: "MOBILITY",
    workoutDuration: 30,
    perceivedExertion: 3,
    sorenessLevel: 3,
    sleepDuration: 8.1,
    sleepQuality: 8,
    energyLevel: 8,
    notes: "Hip and thoracic mobility flow, moved well.",
  },
  {
    workoutType: "REST",
    workoutDuration: 0,
    perceivedExertion: 1,
    sorenessLevel: 2,
    sleepDuration: 8.4,
    sleepQuality: 9,
    energyLevel: 8,
    notes: "Full rest day with short walk and hydration focus.",
  },
  {
    workoutType: "STRENGTH",
    workoutDuration: 60,
    perceivedExertion: 9,
    sorenessLevel: 7,
    sleepDuration: 6.9,
    sleepQuality: 6,
    energyLevel: 6,
    notes: "Upper body push-pull. Grip fatigue late in session.",
  },
  {
    workoutType: "CARDIO",
    workoutDuration: 35,
    perceivedExertion: 7,
    sorenessLevel: 5,
    sleepDuration: 7.2,
    sleepQuality: 7,
    energyLevel: 7,
    notes: "Intervals on bike, strong effort on final rounds.",
  },
  {
    workoutType: "OTHER",
    workoutDuration: 50,
    perceivedExertion: 6,
    sorenessLevel: 5,
    sleepDuration: 7.7,
    sleepQuality: 7,
    energyLevel: 7,
    notes: "Mixed circuit and core work, moderate intensity.",
  },
  {
    workoutType: "MOBILITY",
    workoutDuration: 25,
    perceivedExertion: 2,
    sorenessLevel: 3,
    sleepDuration: 8.2,
    sleepQuality: 9,
    energyLevel: 9,
    notes: "Light mobility and breathing before bed.",
  },
  {
    workoutType: "REST",
    workoutDuration: 0,
    perceivedExertion: 1,
    sorenessLevel: 2,
    sleepDuration: 8.0,
    sleepQuality: 8,
    energyLevel: 8,
    notes: "Rest and meal prep day. Felt refreshed.",
  },
  {
    workoutType: "STRENGTH",
    workoutDuration: 52,
    perceivedExertion: 8,
    sorenessLevel: 6,
    sleepDuration: 7.0,
    sleepQuality: 7,
    energyLevel: 7,
    notes: "Compound lifts. Bar speed improved versus last week.",
  },
  {
    workoutType: "CARDIO",
    workoutDuration: 45,
    perceivedExertion: 7,
    sorenessLevel: 4,
    sleepDuration: 7.6,
    sleepQuality: 8,
    energyLevel: 8,
    notes: "Tempo run, controlled pace and solid form.",
  },
  {
    workoutType: "MOBILITY",
    workoutDuration: 28,
    perceivedExertion: 3,
    sorenessLevel: 3,
    sleepDuration: 8.3,
    sleepQuality: 9,
    energyLevel: 9,
    notes: "Ankles and hamstrings felt less tight.",
  },
  {
    workoutType: "REST",
    workoutDuration: 0,
    perceivedExertion: 1,
    sorenessLevel: 2,
    sleepDuration: 8.5,
    sleepQuality: 9,
    energyLevel: 9,
    notes: "Deload day and extra stretching.",
  },
  {
    workoutType: "STRENGTH",
    workoutDuration: 58,
    perceivedExertion: 8,
    sorenessLevel: 6,
    sleepDuration: 7.1,
    sleepQuality: 7,
    energyLevel: 7,
    notes: "Posterior-chain focus. Needed longer warmup.",
  },
];

function toDateOnly(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function daysAgo(count: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - count);
  return toDateOnly(date);
}

async function main() {
  console.log("Seeding database...");

  const hashedPassword = await bcrypt.hash(demoPassword, 12);
  const demoUser = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {
      name: "Demo User",
      password: hashedPassword,
      age: 31,
      gender: "prefer_not_to_say",
      weight: 74.5,
      height: 175,
      trainingLevel: "intermediate",
      trainingGoal: "general_fitness",
      injuryNotes: "Past right-knee strain from running. No current pain.",
    },
    create: {
      email: demoEmail,
      name: "Demo User",
      password: hashedPassword,
      age: 31,
      gender: "prefer_not_to_say",
      weight: 74.5,
      height: 175,
      trainingLevel: "intermediate",
      trainingGoal: "general_fitness",
      injuryNotes: "Past right-knee strain from running. No current pain.",
    },
  });

  console.log(`Ensured demo user: ${demoUser.email}`);

  for (let index = 0; index < 14; index += 1) {
    const template = entryTemplates[index % entryTemplates.length];
    const date = daysAgo(index);

    await prisma.entry.upsert({
      where: {
        userId_date: {
          userId: demoUser.id,
          date,
        },
      },
      update: {
        workoutType: template.workoutType,
        workoutDuration: template.workoutDuration,
        perceivedExertion: template.perceivedExertion,
        sorenessLevel: template.sorenessLevel,
        sleepDuration: template.sleepDuration,
        sleepQuality: template.sleepQuality,
        energyLevel: template.energyLevel,
        notes: template.notes,
      },
      create: {
        userId: demoUser.id,
        date,
        workoutType: template.workoutType,
        workoutDuration: template.workoutDuration,
        perceivedExertion: template.perceivedExertion,
        sorenessLevel: template.sorenessLevel,
        sleepDuration: template.sleepDuration,
        sleepQuality: template.sleepQuality,
        energyLevel: template.energyLevel,
        notes: template.notes,
      },
    });
  }

  console.log("Ensured 14 days of entries.");

  const sampleInsights = [
    {
      weekStartDate: daysAgo(7),
      content:
        "Your recovery trend is improving. Sleep has stayed above 7 hours on most days, which is helping keep soreness stable after strength sessions. Consider keeping one low-intensity day after your hardest workout.",
    },
    {
      weekStartDate: daysAgo(0),
      content:
        "Energy is strongest when mobility and rest days are spaced between higher-exertion sessions. If soreness rises above 6/10 again, reduce volume by 10-15% for one session and prioritize hydration.",
    },
  ];

  for (const insight of sampleInsights) {
    const existingInsight = await prisma.insight.findFirst({
      where: {
        userId: demoUser.id,
        content: insight.content,
      },
    });

    if (!existingInsight) {
      await prisma.insight.create({
        data: {
          userId: demoUser.id,
          weekStartDate: insight.weekStartDate,
          content: insight.content,
        },
      });
    }
  }

  console.log("Ensured sample insights.");
  console.log(`Seed complete. Demo account: ${demoEmail}. See README for credentials.`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
