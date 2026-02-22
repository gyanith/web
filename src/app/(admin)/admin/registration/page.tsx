import RegistrationForm from "./RegistrationForm";

export default function RegistrationsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6 text-white">
        Helpdesk Registration & Payment
      </h1>
      <RegistrationForm />
    </div>
  );
}
