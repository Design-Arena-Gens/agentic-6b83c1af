import { NextResponse } from "next/server";
import { getSummaries } from "@/src/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? 20);
  const summaries = await getSummaries(limit);
  return NextResponse.json(summaries);
}
