import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ eventId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { eventId } = await params;

  // ❌ eventId not found

  if (eventId === "event-1") {
    notFound();
  }

  // ✅ conditional rendering
  return <div className="text-white">eventId ID: {eventId}</div>;
}
