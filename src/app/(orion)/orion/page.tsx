"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Plus,
  Users,
  CreditCard,
  Shield,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { unispace, garetBook, creatoDisplay } from "@/fonts/fonts";
import { useToast } from "@/my_components/Toast";
import Footer from "@/my_components/Footer";

// Actions
import { getLoggedInUser } from "@/lib/actions/auth.actions";
import {
  createTeam,
  getUserTeam,
  addTeamMemberByEmail,
} from "@/lib/actions/team.actions"; // Import new action
import {
  initiateOrionPayment,
  saveOrionIdea,
} from "@/lib/actions/orion.actions";

// Components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Data & Config
const ORION_EVENT_ID = "69879895001e8584a54b";
const ORION_FEE = 500; // Registration Fee

export default function OrionPage() {
  const router = useRouter();
  const toast = useToast();

  // User & Team State
  const [user, setUser] = useState<any>(null);
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);

  // Inputs
  const [newTeamName, setNewTeamName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [idea, setIdea] = useState("");

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      try {
        const loggedInUser = await getLoggedInUser();
        setUser(loggedInUser);

        if (loggedInUser) {
          const userTeam = await getUserTeam(ORION_EVENT_ID, loggedInUser.$id);
          setTeam(userTeam);
          if (userTeam?.orion_idea) setIdea(userTeam.orion_idea);
        }
      } catch (error) {
        console.error("Failed to load Orion data", error);
      } finally {
        // Only set loading to false after everything is loaded
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleCreateTeam = async () => {
    if (!user) return router.push("/auth/login");
    if (!newTeamName.trim()) {
      toast.error("Please enter a team name");
      return;
    }

    setLoading(true);
    try {
      const res = await createTeam(ORION_EVENT_ID, user.$id, newTeamName);
      if (res.success) {
        toast.success("Team created!");
        setShowCreateTeam(false);
        // Reload team
        const userTeam = await getUserTeam(ORION_EVENT_ID, user.$id);
        setTeam(userTeam);
      } else {
        toast.error(res.error);
      }
    } catch (error) {
      toast.error("Failed to create team");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!team || !newMemberEmail) return;
    setLoading(true);
    try {
      const res = await addTeamMemberByEmail(
        team.$id,
        newMemberEmail,
        user.$id,
        ORION_EVENT_ID,
      );
      if (res.success) {
        toast.success("Member added successfully!");
        setNewMemberEmail("");
        // Reload team
        const userTeam = await getUserTeam(ORION_EVENT_ID, user.$id);
        setTeam(userTeam);
      } else {
        toast.error(res.error);
      }
    } catch (error) {
      toast.error("Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveIdea = async () => {
    if (!team) return;
    setLoading(true);
    try {
      const res = await saveOrionIdea(team.$id, idea, "");
      if (res.success) {
        toast.success("Idea saved successfully!");
      } else {
        toast.error(res.error);
      }
    } catch (e) {
      toast.error("Failed to save idea");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!user || !team) return;
    setLoading(true);
    try {
      const res = await initiateOrionPayment(
        {
          teamId: team.$id,
          amount: ORION_FEE,
          name: user.name,
          email: user.email,
          mobile: user.phone || "9999999999", // Fallback if phone not available
          redirectUrl: `${window.location.origin}/orion`,
        },
        user.$id,
      );

      if (res.success && res.paymentSessionId) {
        // Initialize Cashfree Payment - Assuming standard checkout flow or redirect
        // Ideally use Cashfree JS SDK here same as main flow, but for now redirecting or verifying
        // Usually we use load() from cashfree-js and do checkout
        // For simplicity here, if we had a payment link we'd redirect.
        // Since we have session ID, we need the SDK.
        // Let's use the same logic as CheckoutClient if possible or a simple redirect if the actions supported it.
        // Re-using the logic from CheckoutClient.tsx is best.

        // Dynamic Import Cashfree JS
        const { load } = await import("@cashfreepayments/cashfree-js");
        const cashfree = await load({
          mode:
            process.env.NEXT_PUBLIC_PAYMENT_ENV === "PRODUCTION"
              ? "production"
              : "sandbox",
        });

        await cashfree.checkout({
          paymentSessionId: res.paymentSessionId,
          returnUrl: `${window.location.origin}/orion?order_id=${res.orderId}`,
        });
      } else {
        toast.error(res.error || "Payment initiation failed");
      }
    } catch (error) {
      toast.error("Payment failed");
    } finally {
      setLoading(false);
    }
  };

  // Check for payment return
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get("order_id");
    if (orderId && user) {
      // Verify payment
      const verify = async () => {
        setLoading(true);
        // Import verify action dynamically to avoid server/client issues if any
        const { verifyOrionPayment } =
          await import("@/lib/actions/orion.actions");
        const res = await verifyOrionPayment(orderId);
        if (res.success) {
          toast.success("Payment Verified! Registration Complete.");
          router.replace("/orion");
        } else {
          toast.error(
            "Payment Verification Failed: " + (res.status || res.error),
          );
        }
        setLoading(false);
      };
      verify();
    }
  }, [user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 text-[#d4a574]">
        <Loader2 className="animate-spin w-10 h-10" />
        <p
          className={`${unispace.className} text-sm tracking-wider animate-pulse`}
        >
          SEARCHING FOR REGISTERED TEAM...
        </p>
      </div>
    );
  }

  const isLeader = team?.leader_id === user?.$id;
  const isTeamFull = team?.members.length >= 3;

  return (
    <div className="min-h-screen w-full bg-black text-white relative overflow-x-hidden selection:bg-[#d4a574] selection:text-black">
      {/* Background Ambience similar to Residence Page */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px]" />
      </div>

      {/* Navbar Placeholder / Back Button */}
      <div className="absolute top-6 left-6 z-50">
        <Button
          variant="ghost"
          className="text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300"
          onClick={() => router.push("/")}
        >
          &larr; HOME
        </Button>
      </div>

      <main className="relative z-10 container mx-auto px-4 py-20 flex flex-col gap-12">
        {/* Hero Section */}
        <section className="text-center flex flex-col items-center gap-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${creatoDisplay.className} text-6xl md:text-8xl font-bold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-[#d4a574] to-[#8a6a4b]`}
          >
            ORION
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="h-1 w-24 bg-[#d4a574] rounded-full"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`${garetBook.className} max-w-2xl text-lg text-white/70 leading-relaxed`}
          >
            Ignite your innovation at the Orion Ideathon. Gather your team,
            brainstorm groundbreaking solutions, and compete for glory. A test
            of creativity, strategy, and technical prowess.
          </motion.p>
        </section>

        {/* Event Details Section */}
        <section className="max-w-5xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#111]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 mb-8"
          >
            <h2
              className={`${unispace.className} text-2xl md:text-3xl text-[#d4a574] mb-6 text-center`}
            >
              THE GREAT IDEA-THON
            </h2>

            {/* Rounds Section */}
            <div className="space-y-6 mb-8">
              <h3
                className={`${unispace.className} text-lg text-white/80 mb-4`}
              >
                Event Structure
              </h3>

              {/* Round 1 */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6 hover:border-[#d4a574]/30 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 bg-[#d4a574] rounded-full flex items-center justify-center text-black font-bold text-lg">
                    1
                  </div>
                  <div className="flex-1">
                    <h4
                      className={`${unispace.className} text-base md:text-lg text-white mb-2`}
                    >
                      Round 1 - On Campus
                    </h4>
                    <p className="text-white/60 text-sm md:text-base leading-relaxed">
                      Teams work on projects based on their pre-defined ideas at
                      our college campus.
                    </p>
                  </div>
                </div>
              </div>

              {/* Round 2 */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6 hover:border-[#d4a574]/30 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 bg-[#d4a574] rounded-full flex items-center justify-center text-black font-bold text-lg">
                    2
                  </div>
                  <div className="flex-1">
                    <h4
                      className={`${unispace.className} text-base md:text-lg text-white mb-2`}
                    >
                      Round 2 - Online Challenge
                    </h4>
                    <p className="text-white/60 text-sm md:text-base leading-relaxed">
                      Qualifying teams receive a specific scenario/problem from
                      Orient.ai to solve remotely.
                    </p>
                  </div>
                </div>
              </div>

              {/* Round 3 */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6 hover:border-[#d4a574]/30 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 bg-[#d4a574] rounded-full flex items-center justify-center text-black font-bold text-lg">
                    3
                  </div>
                  <div className="flex-1">
                    <h4
                      className={`${unispace.className} text-base md:text-lg text-white mb-2`}
                    >
                      Grand Finale - On Campus
                    </h4>
                    <p className="text-white/60 text-sm md:text-base leading-relaxed">
                      Finalists return to campus for an on-the-spot problem
                      statement challenge and create innovative solutions.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Team & Registration Info */}
            <div className="grid md:grid-cols-2 gap-4 pt-6 border-t border-white/10">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <h4 className={`${unispace.className} text-sm text-blue-400`}>
                    TEAM SIZE
                  </h4>
                </div>
                <p className="text-white text-lg md:text-xl font-bold">
                  2 - 3 Members
                </p>
                <p className="text-white/50 text-xs mt-1">per team</p>
              </div>

              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard className="w-5 h-5 text-green-400" />
                  <h4
                    className={`${unispace.className} text-sm text-green-400`}
                  >
                    REGISTRATION FEE
                  </h4>
                </div>
                <p className="text-white text-lg md:text-xl font-bold">₹500</p>
                <p className="text-white/50 text-xs mt-1">per team</p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Main Content Area */}
        <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full">
          {!team ? (
            /* No Team - Show Create/Join Options */
            <div className="grid lg:grid-cols-2 gap-8">
              {/* LEFT: Create Team Card */}
              <div className="bg-[#111]/80 backdrop-blur-md border border-white/10 p-8 rounded-2xl relative overflow-hidden group hover:border-[#d4a574]/30 transition-all duration-500">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Users className="w-24 h-24 text-[#d4a574]" />
                </div>
                <h3
                  className={`${unispace.className} text-2xl mb-4 text-[#d4a574]`}
                >
                  CREATE TEAM
                </h3>
                <p className="text-white/60 text-sm mb-6 leading-relaxed">
                  Form your squad for Orion Ideathon. You can add up to 2 other
                  members to make a team of 3.
                </p>
                <Button
                  onClick={() =>
                    user ? setShowCreateTeam(true) : router.push("/auth/login")
                  }
                  className="w-full bg-[#d4a574] text-black hover:bg-[#c49a6b] font-bold tracking-wide transition-all duration-300 hover:scale-105"
                >
                  {user ? "CREATE TEAM" : "LOGIN TO PARTICIPATE"}
                </Button>
              </div>

              {/* RIGHT: Registration Fee Card */}
              <div className="bg-[#111]/80 backdrop-blur-md border border-white/10 p-8 rounded-2xl relative group hover:border-green-500/30 transition-all duration-500">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <CreditCard className="w-24 h-24 text-green-500" />
                </div>
                <h3
                  className={`${unispace.className} text-2xl mb-4 text-green-400`}
                >
                  REGISTRATION FEE
                </h3>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                    <span className="text-white/60">Per Team</span>
                    <span
                      className={`${unispace.className} text-3xl text-[#d4a574]`}
                    >
                      ₹{ORION_FEE}
                    </span>
                  </div>
                  <p className="text-white/50 text-xs">
                    * Team leader will handle the payment after team creation
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Has Team - Show Team Details & Payment */
            <div className="grid lg:grid-cols-2 gap-8">
              {/* LEFT: Team Details Card */}
              <div className="bg-[#111]/80 backdrop-blur-md border border-white/10 p-8 rounded-2xl relative overflow-hidden group hover:border-[#d4a574]/30 transition-all duration-500">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Shield className="w-24 h-24 text-[#d4a574]" />
                </div>

                <div className="flex flex-col gap-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2
                        className={`${unispace.className} text-3xl text-[#d4a574] mb-1`}
                      >
                        {team.name}
                      </h2>
                      <p className="text-xs text-white/40 font-mono">
                        ID: {team.$id}
                      </p>
                    </div>
                    <div className="px-3 py-1 bg-[#d4a574]/10 border border-[#d4a574]/20 rounded text-[#d4a574] text-xs font-bold uppercase tracking-wider">
                      {team.members.length} / 3 MEMBERS
                    </div>
                  </div>

                  {/* Members List */}
                  <div className="flex flex-col gap-3">
                    {team.members.map((m: any) => (
                      <div
                        key={m.$id}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${m.role === "LEADER" ? "bg-[#d4a574] text-black" : "bg-white/10 text-white"}`}
                          >
                            {m.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{m.name}</p>
                            <p className="text-xs text-white/40">{m.email}</p>
                          </div>
                        </div>
                        {m.role === "LEADER" && (
                          <span className="text-[10px] bg-[#d4a574]/20 text-[#d4a574] px-2 py-0.5 rounded">
                            LEADER
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add Member Action (Leader Only) */}
                  {isLeader && !isTeamFull && (
                    <div className="mt-2 pt-4 border-t border-white/10 flex flex-col gap-3">
                      <Label className="text-xs text-white/60 uppercase tracking-widest">
                        Add Member
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter member's email"
                          value={newMemberEmail}
                          onChange={(e) => setNewMemberEmail(e.target.value)}
                          className="bg-black/50 border-white/20 text-white h-10 text-sm focus:border-[#d4a574]"
                        />
                        <Button
                          onClick={handleAddMember}
                          disabled={loading || !newMemberEmail}
                          size="sm"
                          className="bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all duration-300"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-[10px] text-white/30">
                        * Member must be registered on Gyanith platform first.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT: Registration & Payment Card */}
              <div className="bg-[#111]/80 backdrop-blur-md border border-white/10 p-8 rounded-2xl relative group hover:border-green-500/30 transition-all duration-500">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <CreditCard className="w-24 h-24 text-green-500" />
                </div>

                <h3
                  className={`${unispace.className} text-2xl mb-6 text-green-400`}
                >
                  REGISTRATION
                </h3>

                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                    <span className="text-white/60">Team Registration Fee</span>
                    <span
                      className={`${unispace.className} text-2xl text-[#d4a574]`}
                    >
                      ₹{ORION_FEE}
                    </span>
                  </div>

                  {isLeader ? (
                    <Button
                      onClick={handlePayment}
                      disabled={loading}
                      className="w-full bg-[#d4a574] text-black hover:bg-[#c49a6b] font-bold h-12 text-lg tracking-wide transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#d4a574]/20"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        "PAY & REGISTER TEAM"
                      )}
                    </Button>
                  ) : (
                    <div className="p-4 bg-yellow-900/10 border border-yellow-500/20 rounded text-yellow-500 text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Wait for your Team Leader to complete registration.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* BOTTOM WIDE: Project Idea Section (Only if team exists) */}
          {team && (
            <div className="bg-[#111]/80 backdrop-blur-md border border-white/10 p-8 rounded-2xl relative group hover:border-[#d4a574]/30 transition-all duration-500">
              <h3
                className={`${unispace.className} text-2xl mb-6 flex items-center gap-2`}
              >
                PROJECT IDEA <span className="text-[#d4a574]">*</span>
              </h3>

              <div className="flex flex-col gap-4">
                <Textarea
                  placeholder="Describe your project idea briefly... What problem does it solve? What makes it unique?"
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  disabled={!isLeader}
                  className="bg-black/50 border-white/20 min-h-[200px] text-white/90 focus:border-[#d4a574] resize-none"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-white/40">
                    {isLeader
                      ? "Only team leader can edit the project idea"
                      : "Only your team leader can edit this"}
                  </p>
                  {isLeader && (
                    <Button
                      onClick={handleSaveIdea}
                      disabled={loading}
                      variant="outline"
                      className="border-[#d4a574]/50 text-black hover:bg-[#d4a574] hover:border-[#d4a574] transition-all duration-300"
                    >
                      SAVE IDEA
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* CREATE TEAM MODAL */}
      <AnimatePresence>
        {showCreateTeam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111] border border-white/20 p-8 rounded-2xl w-full max-w-md shadow-2xl"
            >
              <h2 className={`${unispace.className} text-2xl mb-2`}>
                Create Team
              </h2>
              <p className="text-white/50 text-sm mb-6">
                Enter a unique name for your team.
              </p>

              <Input
                placeholder="Team Name"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                className="bg-black border-white/20 text-white mb-6 h-12"
                autoFocus
              />

              <div className="flex gap-3 justify-end">
                <Button
                  variant="ghost"
                  onClick={() => setShowCreateTeam(false)}
                  className="hover:bg-white/10 transition-all duration-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTeam}
                  disabled={loading}
                  className="bg-[#d4a574] text-black hover:bg-[#c49a6b] transition-all duration-300 hover:scale-105"
                >
                  {loading ? "Creating..." : "Create Team"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
