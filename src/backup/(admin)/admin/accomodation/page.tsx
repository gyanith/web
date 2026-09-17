import AccommodationForm from "./AccommodationForm";
import AccommodationExport from "./AccommodationExport";

export const dynamic = "force-dynamic";

export default function AccommodationPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 px-4">
        <h1 className="text-2xl font-bold text-white text-center sm:text-left">
          Admin Accommodation Booking
        </h1>
        <AccommodationExport />
      </div>
      <AccommodationForm />
    </div>
  );
}
