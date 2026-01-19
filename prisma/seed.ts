import { PrismaClient } from "@prisma/client";

const prismadb = new PrismaClient();

type SeedReactionType = {
  key: string;
  label: string;
  emoji?: string;
  order: number;
};

const DEFAULT_REACTION_TYPES: SeedReactionType[] = [
  { key: "LIKE", label: "Like", emoji: "👍", order: 1 },
  { key: "LOVE", label: "Love", emoji: "❤️", order: 2 },
  { key: "LAUGH", label: "Laugh", emoji: "😂", order: 3 },
  { key: "WOW", label: "Wow", emoji: "😮", order: 4 },
  { key: "SAD", label: "Sad", emoji: "😢", order: 5 },
  { key: "ANGRY", label: "Angry", emoji: "😡", order: 6 },
];

async function main() {
  for (const rt of DEFAULT_REACTION_TYPES) {
    await (prismadb as any).reactionType.upsert({
      where: { key: rt.key },
      update: {
        label: rt.label,
        emoji: rt.emoji,
        order: rt.order,
        isActive: true,
      },
      create: {
        key: rt.key,
        label: rt.label,
        emoji: rt.emoji,
        order: rt.order,
        isActive: true,
      },
    });
  }
}

main()
  .then(async () => {
    await prismadb.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prismadb.$disconnect();
    process.exit(1);
  });

