import { NextResponse } from "next/server";
import { getRecentJobs } from "@/src/lib/db";

export async function GET() {
  const jobs = await getRecentJobs(10);
  return NextResponse.json(jobs);
}
