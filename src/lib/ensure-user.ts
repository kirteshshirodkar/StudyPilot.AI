
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function ensureDatabaseUser(clerkId: string) {
  const clerkUser = await currentUser();

  if (!clerkUser || clerkUser.id !== clerkId) {
    throw new Error("Authenticated Clerk user not found");
  }

  const email =
    clerkUser.primaryEmailAddress?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) {
    throw new Error("Your Clerk account needs an email address");
  }

  const name =
    [clerkUser.firstName, clerkUser.lastName]
      .filter(Boolean)
      .join(" ") || null;

  return prisma.user.upsert({
    where: { clerkId },
    create: {
      clerkId,
      email,
      name,
      imageUrl: clerkUser.imageUrl,
    },
    update: {
      email,
      name,
      imageUrl: clerkUser.imageUrl,
    },
  });
}
