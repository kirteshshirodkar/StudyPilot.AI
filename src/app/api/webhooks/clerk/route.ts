
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  // 1. Verify that the request genuinely came from Clerk.
  let event;

  try {
    event = await verifyWebhook(request);
  } catch (error) {
    console.error("Clerk webhook verification failed:", error);

    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  // 2. Process the verified event.
  try {
    switch (event.type) {
      case "user.created":
      case "user.updated": {
        const clerkUser = event.data;

        const primaryEmail = clerkUser.email_addresses.find(
          (email) => email.id === clerkUser.primary_email_address_id
        )?.email_address;

        const email = primaryEmail ?? clerkUser.email_addresses[0]?.email_address;

        if (!email) {
          console.error("Clerk user has no email address:", clerkUser.id);

          return NextResponse.json(
            { error: "User does not have an email address" },
            { status: 422 }
          );
        }

        const name =
          [clerkUser.first_name, clerkUser.last_name]
            .filter(Boolean)
            .join(" ") || null;

        await prisma.user.upsert({
          where: {
            clerkId: clerkUser.id,
          },
          create: {
            clerkId: clerkUser.id,
            email,
            name,
            imageUrl: clerkUser.image_url,
          },
          update: {
            email,
            name,
            imageUrl: clerkUser.image_url,
          },
        });

        console.log(`Clerk user synchronized: ${clerkUser.id}`);

        break;
      }

      case "user.deleted": {
        const clerkUserId = event.data.id;

        if (clerkUserId) {
          await prisma.user.deleteMany({
            where: {
              clerkId: clerkUserId,
            },
          });

          console.log(`Clerk user deleted: ${clerkUserId}`);
        }

        break;
      }

      default:
        console.log(`Ignored Clerk event: ${event.type}`);
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    // Return 500 so Clerk can retry transient database failures.
    console.error("Clerk webhook processing failed:", error);

    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
