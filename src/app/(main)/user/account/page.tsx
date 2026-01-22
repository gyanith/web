"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import { pressStart2P } from "@/fonts/fonts";

import { signOut, getLoggedInUser } from "@/lib/actions/auth";

const Page = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const loggedInUser = await getLoggedInUser();
        setUser(loggedInUser);
      } catch (err) {
        console.error("Failed to fetch user", err);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    await signOut();
    setUser(null);
    setLoading(false);
    router.refresh();
  };

  const handleLoginRedirect = () => {
    router.push("/auth");
  };

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center ">
        <span className="text-white/50 animate-pulse font-mono">
          Loading...
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "circInOut" }}
      className="w-screen h-screen flex flex-col items-center justify-center relative overflow-hidden"
    >
      <div className="absolute inset-0 w-screen h-screen -z-10 bg-zinc-900">
        <div className="w-full h-full opacity-50 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-zinc-800 to-black"></div>
      </div>

      <div className="w-96 flex flex-col items-center justify-center h-96 rounded-2xl bg-black/50 backdrop-blur-xl border border-white/10 shadow-2xl">
        <div className="mb-8 text-white/50 text-sm font-mono">
          {user ? `Logged in as ${user.name}` : "Not logged in"}
        </div>

        {user ? (
          <button
            className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold tracking-widest rounded-lg transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.5)] hover:shadow-[0_0_40px_rgba(220,38,38,0.7)] active:scale-95"
            onClick={handleLogout}
          >
            LOG OUT
          </button>
        ) : (
          <button
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-widest rounded-lg transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.5)] hover:shadow-[0_0_40px_rgba(37,99,235,0.7)] active:scale-95"
            onClick={handleLoginRedirect}
          >
            LOG IN
          </button>
        )}
      </div>
      <div className="flex flex-col items-center justify-center">
        <span className="flex mt-2">
          <button
            className={`hover:bg-[#D4A574]  hover:text-black cursor-pointer text-right text-[#D4A574] border-[#D4A574] border p-2 rounded-lg text-[12px] ${pressStart2P.className}`}
            onClick={() => router.push("/privacy-policy")}
          >
            Privacy Policy
          </button>
        </span>
        <span className="flex  mt-2">
          <button
            className={`hover:bg-[#D4A574]  hover:text-black cursor-pointer text-right text-[#D4A574] border-[#D4A574] border p-2 rounded-lg text-[12px] ${pressStart2P.className}`}
            onClick={() => router.push("/terms-and-conditions")}
          >
            Terms & Conditions
          </button>
        </span>

        <span className="flex  mt-2">
          <button
            className={`hover:bg-[#D4A574]  hover:text-black cursor-pointer text-right text-[#D4A574] border-[#D4A574] border p-2 rounded-lg text-[12px] ${pressStart2P.className}`}
            onClick={() => router.push("/contacts")}
          >
            Contact Us
          </button>
        </span>
      </div>
    </motion.div>
  );
};

export default Page;
