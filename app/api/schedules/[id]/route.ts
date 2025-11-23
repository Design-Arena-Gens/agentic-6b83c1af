import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteSchedule, updateSchedule } from "@/src/lib/db";
import { refreshScheduler } from "@/src/lib/scheduler";

const updateSchema = z.object({
  name: z.string().min(3).optional(),
  cron: z.string().min(5).optional(),
  timezone: z.string().optional(),
  enabled: z.boolean().optional()
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const payload = await request.json();
  const parsed = updateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const updated = await updateSchedule(Number(params.id), parsed.data);
  await refreshScheduler();
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await deleteSchedule(Number(params.id));
  await refreshScheduler();
  return NextResponse.json({ success: true });
}
