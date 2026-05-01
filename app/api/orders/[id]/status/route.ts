import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { z } from "zod";

const payloadSchema = z.object({
  status: z.enum(["mottatt", "forberedes", "klar", "levert"]),
});

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const sql = neon(process.env.DATABASE_URL || "");

type StatusUpdateRow = {
  id: number;
  status: "mottatt" | "forberedes" | "klar" | "levert";
};

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

  try {
    const result = (await sql`
      UPDATE orders
      SET status = ${payload.data.status}
      WHERE id = ${params.data.id}
      RETURNING id, status
    `) as StatusUpdateRow[];

    if (!result.length) {
      return NextResponse.json(
        { error: "Ordre ikke funnet." },
        { status: 404 },
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: "Kunne ikke oppdatere status." },
      { status: 500 },
    );
  }
}
