import { NextRequest, NextResponse } from "next/server";
import { getManyClicks } from "@/lib/store";

const MAX_CODES = 50;

interface StatsBody {
  codes?: unknown;
}

export async function POST(req: NextRequest) {
  let body: StatsBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON body with a codes array." }, { status: 400 });
  }

  const codes = Array.isArray(body.codes)
    ? body.codes.filter((c): c is string => typeof c === "string").slice(0, MAX_CODES)
    : [];

  const clicks = await getManyClicks(codes);
  return NextResponse.json({ clicks });
}
