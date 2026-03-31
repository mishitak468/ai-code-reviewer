import { NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "../../lib/prisma";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { code, language } = body;

    if (!code) {
      return new NextResponse("Code is required", { status: 400 });
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert senior software engineer and code reviewer. 
          Review the provided code for bugs, security vulnerabilities, and performance issues.
          You must return ONLY a JSON object with this exact structure:
          {
            "score": number (1-10),
            "summary": "one sentence overview",
            "issues": ["issue 1", "issue 2"],
            "improvements": ["suggestion 1"],
            "fixedCode": "the full corrected version of the code"
          }`
        },
        {
          role: "user",
          content: `Review this ${language} code:\n\n${code}`
        }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const feedback = JSON.parse(chatCompletion.choices[0].message.content || "{}");


    await prisma.$transaction(async (tx) => {
      await tx.user.upsert({
        where: { id: userId },
        update: {},
        create: { id: userId },
      });

      await tx.review.create({
        data: {
          userId,
          code,
          language,
          feedback: feedback,
        },
      });
    });

    return NextResponse.json(feedback);

  } catch (error: any) {
    console.error("Groq/Prisma API Error:", error);

    if (error.code === 'P2003') {
      return new NextResponse("Database Relation Error: User record missing", { status: 500 });
    }

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}