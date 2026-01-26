"use client"; // 👈 MANDATORY: Runs this code in the browser

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Client, Account } from "appwrite";
import { checkUserProfile } from "@/lib/actions/auth"; // Importing your Server Action

// Initialize Appwrite Web SDK (Client Side)
const client = new Client()
  .setEndpoint(
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
      "https://console.gyanith.org/v1",
  )
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const account = new Account(client);

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Finalizing secure login...");

  useEffect(() => {
    const finishLogin = async () => {
      // 1. Extract params from URL
      const userId = searchParams.get("userId");
      const secret = searchParams.get("secret");

      if (!userId || !secret) {
        setStatus("Error: Missing login credentials.");
        return router.push("/auth?error=invalid_oauth_params");
      }

      try {
        // 2. Create Session (THIS SETS THE BROWSER COOKIE) 🍪
        // We pass arguments directly, not as an object
        await account.createSession(userId, secret);

        // 3. Verify Session
        const user = await account.get();
        console.log("✅ Logged in as:", user.$id);

        // 4. Check if Profile Exists (using your Server Action)
        // We can call Server Actions directly from Client Components
        const { exists } = await checkUserProfile(user.$id);

        if (!exists) {
          console.log("📝 Profile missing, redirecting to completion...");
          // Redirect to completion mode
          router.push("/auth?mode=oauth_complete");
        } else {
          console.log("✅ Profile found, redirecting home...");
          router.push("/");
        }
      } catch (error: any) {
        console.error("❌ Login Failed:", error);
        setStatus("Login failed. Please try again.");
        // Optional: Redirect back to login after delay
        setTimeout(() => router.push("/auth?error=session_failed"), 2000);
      }
    };

    finishLogin();
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      {/* Simple Loading Spinner */}
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      <p className="text-muted-foreground animate-pulse">{status}</p>
    </div>
  );
}

// ⚠️ Must wrap in Suspense because we use useSearchParams
export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<div>Loading auth...</div>}>
      <OAuthCallbackContent />
    </Suspense>
  );
}
