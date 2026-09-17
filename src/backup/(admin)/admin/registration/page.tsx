import RegistrationForm from "./RegistrationForm";
import RegistrationsExport from "./RegistrationsExport";

export default function RegistrationsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6 text-white">
        Helpdesk Registration & Payment
      </h1>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        <RegistrationForm />
        <RegistrationsExport />
      </div>
    </div>
  );
}
