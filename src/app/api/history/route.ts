export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "../../lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const history = await prisma.review.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }, // Newest first
    });

    return NextResponse.json(history);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}