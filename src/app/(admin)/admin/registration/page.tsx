async function fetchRegistrations() {
  // TODO: fetch all registrations
}

export default async function RegistrationsPage() {
  await fetchRegistrations();

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Registrations</h1>
      {/* Table here */}
    </div>
  );
}
