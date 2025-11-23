import { NextResponse } from "next/server";
import { z } from "zod";
import { queueAggregation } from "@/src/lib/queue";
import { initializeScheduler } from "@/src/lib/scheduler";

const payloadSchema = z.object({
  sourceIds: z.array(z.number()).optional(),
  force: z.boolean().optional()
});

export async function POST(request: Request) {
  await initializeScheduler();
  const payload = await request.json().catch(() => ({}));
  const parsed = payloadSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const queue = queueAggregation();
  await queue.enqueue(parsed.data);

  return NextResponse.json({ enqueued: true });
}
