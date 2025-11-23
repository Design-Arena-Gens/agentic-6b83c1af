import { NextResponse } from "next/server";
import { z } from "zod";
import { createSource, getSources } from "@/src/lib/db";

const createSourceSchema = z.object({
  name: z.string().min(3),
  url: z.string().url(),
  tags: z.array(z.string()).optional(),
  type: z.enum(["website", "rss", "application"]).default("website"),
  enabled: z.boolean().default(true)
});

export async function GET() {
  const sources = await getSources();
  return NextResponse.json(sources);
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = createSourceSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const created = await createSource({
    ...parsed.data,
    tags: parsed.data.tags ?? []
  });
  return NextResponse.json(created, { status: 201 });
}
