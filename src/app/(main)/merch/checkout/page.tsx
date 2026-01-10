import { Suspense } from "react";
import CheckoutPage from "./CheckoutPage";

const page = () => {
  return (
    <Suspense>
      <CheckoutPage />
    </Suspense>
  );
};

export default page;
