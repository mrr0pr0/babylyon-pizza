import { NextResponse } from "next/server";
import { z } from "zod";

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const parsed = paramsSchema.safeParse(await context.params);

  if (!parsed.success) {
    return NextResponse.json({ error: "Ugyldig ordre-ID." }, { status: 400 });
  }

  return NextResponse.json({
    id: parsed.data.id,
    status: "mottatt",
    estimatedMinutes: 25,
  });
}
