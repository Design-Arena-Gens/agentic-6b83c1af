import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteSource, updateSource } from "@/src/lib/db";

const updateSchema = z.object({
  name: z.string().min(3).optional(),
  url: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  type: z.enum(["website", "rss", "application"]).optional(),
  enabled: z.boolean().optional()
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const payload = await request.json();
  const parsed = updateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const updated = await updateSource(Number(params.id), parsed.data);
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await deleteSource(Number(params.id));
  return NextResponse.json({ success: true });
}
