import { NextResponse } from "next/server";
import { z } from "zod";

const payloadSchema = z.object({
  status: z.enum(["mottatt", "forberedes", "klar", "levert"]),
});

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const params = paramsSchema.safeParse(await context.params);
  if (!params.success) {
    return NextResponse.json({ error: "Ugyldig ordre-ID." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const payload = payloadSchema.safeParse(body);
  if (!payload.success) {
    return NextResponse.json({ error: "Ugyldig status." }, { status: 400 });
  }

  return NextResponse.json({
    id: params.data.id,
    status: payload.data.status,
  });
}
