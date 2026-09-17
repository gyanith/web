import SimpleSpinner from "@/my_components/SimpleSpinner";

export default function Loading() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <SimpleSpinner color="#d4a574" size={50} />
    </div>
  );
}
