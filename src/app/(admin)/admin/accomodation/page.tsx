import AccommodationForm from "./AccommodationForm";

export const dynamic = "force-dynamic";

export default function AccommodationPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-white text-center">
        Admin Accommodation Booking
      </h1>
      <AccommodationForm />
    </div>
  );
}
