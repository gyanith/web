import { notFound } from "next/navigation";
import Aurora from "@/components/Aurora";
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
  return (
    <div className="text-white w-fit h-fit">
      <div className="absolute inset-0 rotate-180 z-0 w-screen h-screen">
        <Aurora
          colorStops={["#967656", "#AAAAAA", "110A05"]}
          blend={0.7}
          amplitude={0.5}
          speed={1}
        />
      </div>
      eventId ID: {eventId}
    </div>
  );
}
