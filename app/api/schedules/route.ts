import { NextResponse } from "next/server";
import { z } from "zod";
import { createSchedule, getSchedules } from "@/src/lib/db";
import { refreshScheduler } from "@/src/lib/scheduler";

const createSchema = z.object({
  name: z.string().min(3),
  cron: z.string().min(5),
  timezone: z.string().default("UTC"),
  enabled: z.boolean().default(true)
});

export async function GET() {
  const schedules = await getSchedules();
  return NextResponse.json(schedules);
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = createSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const created = await createSchedule(parsed.data);
  await refreshScheduler();
  return NextResponse.json(created, { status: 201 });
}
