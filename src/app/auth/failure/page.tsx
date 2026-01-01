"use client";

import { useNavigate } from "@/hooks/useNavigate";
const page = () => {
  const navigate = useNavigate();

  setTimeout(() => {
    navigate("/auth");
  }, 3000);
  return (
    <div className="text-5xl text-red-400">
      SIGN UP UNSUCCESSFUL <br /> PLEASE TRY AGAIN
    </div>
  );
};

export default page;
