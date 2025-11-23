import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteDeliveryPreference, updateDeliveryPreference } from "@/src/lib/db";

const updateSchema = z.object({
  channel: z.enum(["email", "telegram"]).optional(),
  address: z.string().min(3).optional(),
  scheduleId: z.number().nullable().optional(),
  metadata: z.record(z.any()).optional()
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const payload = await request.json();
  const parsed = updateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const updated = await updateDeliveryPreference(Number(params.id), parsed.data);
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await deleteDeliveryPreference(Number(params.id));
  return NextResponse.json({ success: true });
}
