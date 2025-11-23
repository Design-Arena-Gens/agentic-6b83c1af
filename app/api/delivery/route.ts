import { NextResponse } from "next/server";
import { z } from "zod";
import { createDeliveryPreference, getDeliveryPreferences } from "@/src/lib/db";

const createSchema = z.object({
  channel: z.enum(["email", "telegram"]),
  address: z.string().min(3),
  scheduleId: z.number().nullable().optional(),
  metadata: z.record(z.any()).optional()
});

export async function GET() {
  const preferences = await getDeliveryPreferences();
  return NextResponse.json(preferences);
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = createSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const created = await createDeliveryPreference({
    ...parsed.data,
    scheduleId: parsed.data.scheduleId ?? null,
    metadata: parsed.data.metadata ?? {}
  });
  return NextResponse.json(created, { status: 201 });
}
