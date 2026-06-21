import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, codeExists, createLink } from "@/lib/store";
import { generateCode } from "@/lib/codegen";
import { normalizeUrl, validateAlias } from "@/lib/validators";

interface ShortenBody {
  url?: string;
  alias?: string;
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anonymous";

  const { allowed } = await checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many links from this address — wait a few minutes and try again." },
      { status: 429 }
    );
  }

  let body: ShortenBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Send a valid JSON body with a url." }, { status: 400 });
  }

  if (!body.url || typeof body.url !== "string") {
    return NextResponse.json({ error: "A url is required." }, { status: 400 });
  }

  const normalized = normalizeUrl(body.url);
  if (!normalized.ok) {
    return NextResponse.json({ error: normalized.error }, { status: 400 });
  }

  const wantsAlias = Boolean(body.alias && body.alias.trim());
  let code: string;

  if (wantsAlias) {
    const alias = body.alias!.trim();
    const validation = validateAlias(alias);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    if (await codeExists(alias)) {
      return NextResponse.json({ error: "That alias is taken — try another." }, { status: 409 });
    }
    code = alias;
  } else {
    let attempts = 0;
    let candidate = generateCode();
    while ((await codeExists(candidate)) && attempts < 6) {
      candidate = generateCode();
      attempts += 1;
    }
    code = candidate;
  }

  const link = await createLink(code, normalized.url, wantsAlias);

  return NextResponse.json(
    { ...link, shortUrl: `${req.nextUrl.origin}/${link.code}` },
    { status: 201 }
  );
}
