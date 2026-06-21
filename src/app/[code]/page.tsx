import { notFound, redirect } from "next/navigation";
import { getLink, incrementClicks } from "@/lib/store";

interface ShortLinkPageProps {
  params: Promise<{ code: string }>;
}

export default async function ShortLinkPage({ params }: ShortLinkPageProps) {
  const { code } = await params;
  const link = await getLink(code);

  if (!link) {
    notFound();
  }

  await incrementClicks(code);
  redirect(link.longUrl);
}
