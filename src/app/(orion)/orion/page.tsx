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
  AlertCircle,
  Trophy,
  Zap,
} from "lucide-react";
import { unispace, garetBook, superRetro } from "@/fonts/fonts";
import { useToast } from "@/my_components/Toast";

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

// --- RETRO UI COMPONENTS ---
const RetroCard = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`relative bg-black/80 border border-[#d4a574]/30 p-1 ${className}`}
  >
    {/* Corner Accents */}
    <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#d4a574]" />
    <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#d4a574]" />
    <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#d4a574]" />
    <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#d4a574]" />

    {/* Inner Content */}
    <div className="bg-[#111]/90 backdrop-blur-sm p-6 h-full relative z-10">
      {children}
    </div>
  </div>
);

const GlitchText = ({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) => (
  <div className={`relative inline-block group ${className}`}>
    <span className="relative z-10">{text}</span>
    <span className="absolute top-0 left-0 -z-10 w-full h-full text-[#d4a574] opacity-0 group-hover:opacity-50 animate-pulse translate-x-[2px]">
      {text}
    </span>
    <span className="absolute top-0 left-0 -z-10 w-full h-full text-red-500 opacity-0 group-hover:opacity-50 animate-pulse -translate-x-[2px]">
      {text}
    </span>
  </div>
);

export default function OrionPage() {
  const router = useRouter();
  const toast = useToast();

  // User & Team State
  const [user, setUser] = useState<any>(null);
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState(
    "SEARCHING FOR REGISTERED TEAM...",
  );

  // Modals
  const [showCreateTeam, setShowCreateTeam] = useState(false);

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
    setLoadingText("CREATING TEAM...");
    try {
      const res = await createTeam(ORION_EVENT_ID, user.$id, newTeamName);
      if (res.success) {
        toast.success("Team created!");
        setShowCreateTeam(false);
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
    setLoadingText("ADDING MEMBER...");
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
    setLoadingText("SAVING IDEA...");
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

    if (!idea || idea.trim().length < 50) {
      toast.error(
        "Project Idea must be at least 50 characters long to proceed with registration.",
      );
      return;
    }

    setLoading(true);
    setLoadingText("PROCESSING PAYMENT...");
    try {
      // Auto-save idea before payment
      await saveOrionIdea(team.$id, idea, "");

      const res = await initiateOrionPayment(
        {
          teamId: team.$id,
          amount: ORION_FEE,
          name: user.name,
          email: user.email,
          mobile: user.phone || "9999999999",
          redirectUrl: `${window.location.origin}/orion`,
        },
        user.$id,
      );

      if (res.success && res.paymentSessionId) {
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
      const verify = async () => {
        setLoading(true);
        setLoadingText("PROCESSING PAYMENT...");
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
        <Loader2 className="animate-spin w-12 h-12" />
        <p
          className={`${unispace.className} text-lg tracking-widest animate-pulse text-center`}
        >
          {loadingText}
        </p>
      </div>
    );
  }

  const isLeader = team?.leader_id === user?.$id;
  const isTeamFull = team?.members.length >= 3;

  return (
    <div className="min-h-screen w-full bg-black text-[#d4a574] relative overflow-x-hidden selection:bg-[#d4a574] selection:text-black font-mono">
      {/* --- RETRO BACKGROUND --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.1]"
          style={{
            backgroundImage: `linear-gradient(#d4a574 1px, transparent 1px), linear-gradient(90deg, #d4a574 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        {/* Scanlines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[1] bg-[length:100%_4px,3px_100%] pointer-events-none" />
        {/* Vignette */}
        <div className="absolute inset-0 bg-radial-gradient(circle, transparent 60%, black 100%) opacity-80" />
      </div>

      {/* Navbar Placeholder / Back Button */}
      <div className="absolute top-6 left-6 z-50">
        <Button
          variant="outline"
          className="border-[#d4a574]/30 text-[#d4a574] bg-black hover:bg-[#d4a574] hover:text-black transition-all duration-300 rounded-none uppercase tracking-widest font-bold"
          onClick={() => router.push("/")}
        >
          &lt; SYSTEM_EXIT
        </Button>
      </div>

      <main className="relative z-10 container mx-auto px-4 py-20 flex flex-col gap-12">
        {/* Hero Section */}
        <section className="text-center flex flex-col items-center gap-6 mt-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <h1
              className={`${superRetro.className} text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-[#d4a574] to-[#8a6a4b] drop-shadow-[0_0_10px_rgba(212,165,116,0.5)]`}
            >
              ORION
            </h1>
            <p
              className={`${unispace.className} text-xl text-[#d4a574]/35 tracking-tighter mt-2`}
            >
              IDEATHON_2026
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center  gap-4 bg-[#d4a574]/10 border border-[#d4a574] px-8 py-4 rounded-none mt-4 backdrop-blur-md"
          >
            <Trophy className="w-12 h-12 text-[#d4a574] animate-pulse" />
            <div className="text-left">
              <p className="text-xs text-[#d4a574]/60 uppercase tracking-wider mb-2">
                Total Prize Pool
              </p>
              <p
                className={`${unispace.className} text-3xl font-bold text-[#d4a574]`}
              >
                ₹ 1.75 LAKHS
              </p>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`${garetBook.className} max-w-2xl text-lg text-[#d4a574]/80 mt-6 text-justify`}
          >
            &gt; INITIATING PROTOCOL: ORION. <br />
            Ignite your innovation. Gather your team, brainstorm groundbreaking
            solutions, and compete for glory. A test of creativity, strategy,
            and technical prowess waiting for you.
          </motion.p>
        </section>

        {/* Event Details Section */}
        <section className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Round 1 */}
          <RetroCard className="h-full hover:bg-[#d4a574]/5 transition-colors duration-300">
            <div className="flex flex-col h-full gap-4">
              <div className="flex justify-between items-start">
                <span
                  className={`${unispace.className} text-4xl text-[#d4a574]/20 font-bold`}
                >
                  01
                </span>
                <Zap className="w-6 h-6 text-[#d4a574]" />
              </div>
              <h3 className={`${unispace.className} text-xl text-[#d4a574]`}>
                HYBRID ROUND
              </h3>
              <p className="text-[#d4a574]/70 text-sm leading-relaxed">
                Teams execute projects based on pre-defined ideas. Attend
                physically at Gyanith Campus or participate Online.
              </p>
              <div className="mt-auto pt-4 border-t border-[#d4a574]/20 w-full">
                <span className="text-xs text-[#d4a574]/40 uppercase tracking-wider">
                  STATUS: ACTIVE
                </span>
              </div>
            </div>
          </RetroCard>

          {/* Round 2 */}
          <RetroCard className="h-full hover:bg-[#d4a574]/5 transition-colors duration-300">
            <div className="flex flex-col h-full gap-4">
              <div className="flex justify-between items-start">
                <span
                  className={`${unispace.className} text-4xl text-[#d4a574]/20 font-bold`}
                >
                  02
                </span>
                <Shield className="w-6 h-6 text-[#d4a574]" />
              </div>
              <h3 className={`${unispace.className} text-xl text-[#d4a574]`}>
                ONLINE CHALLENGE
              </h3>
              <p className="text-[#d4a574]/70 text-sm leading-relaxed">
                Qualifying teams receive a classified scenario from Orient.ai to
                solve remotely.
              </p>
              <div className="mt-auto pt-4 border-t border-[#d4a574]/20 w-full">
                <span className="text-xs text-[#d4a574]/40 uppercase tracking-wider">
                  ACCESS: RESTRICTED
                </span>
              </div>
            </div>
          </RetroCard>

          {/* Round 3 */}
          <RetroCard className="h-full hover:bg-[#d4a574]/5 transition-colors duration-300">
            <div className="flex flex-col h-full gap-4">
              <div className="flex justify-between items-start">
                <span
                  className={`${unispace.className} text-4xl text-[#d4a574]/20 font-bold`}
                >
                  03
                </span>
                <Trophy className="w-6 h-6 text-[#d4a574]" />
              </div>
              <h3 className={`${unispace.className} text-xl text-[#d4a574]`}>
                GRAND FINALE
              </h3>
              <p className="text-[#d4a574]/70 text-sm leading-relaxed">
                On-Campus showdown. On-the-spot problem statement challenge to
                create innovative solutions.
              </p>
              <div className="mt-auto pt-4 border-t border-[#d4a574]/20 w-full">
                <span className="text-xs text-[#d4a574]/40 uppercase tracking-wider">
                  LOCATION: TARGET_ZONE
                </span>
              </div>
            </div>
          </RetroCard>
        </section>

        {/* Main Content Area */}
        <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full">
          {!team ? (
            /* No Team - Show Create/Join Options */
            <div className="grid lg:grid-cols-2 gap-8">
              {/* LEFT: Create Team Card */}
              <RetroCard>
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-4 border-b border-[#d4a574]/20 pb-4">
                    <Users className="w-8 h-8 text-[#d4a574]" />
                    <h3
                      className={`${unispace.className} text-2xl text-[#d4a574]`}
                    >
                      INITIALIZE TEAM
                    </h3>
                  </div>
                  <p className="text-[#d4a574]/80 text-sm leading-relaxed">
                    Form your squad for Orion Ideathon. Max capacity: 3 units.
                  </p>
                  <Button
                    onClick={() =>
                      user
                        ? setShowCreateTeam(true)
                        : router.push("/auth/login")
                    }
                    className="w-full bg-[#d4a574] text-black hover:bg-[#c49a6b] rounded-none font-bold tracking-widest h-12 mt-4"
                  >
                    {user ? "[ CREATE_TEAM ]" : "[ LOGIN_TO_ACCESS ]"}
                  </Button>
                </div>
              </RetroCard>

              {/* RIGHT: Registration Fee Card */}
              <RetroCard>
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-4 border-b border-[#d4a574]/20 pb-4">
                    <CreditCard className="w-8 h-8 text-[#d4a574]" />
                    <h3
                      className={`${unispace.className} text-2xl text-[#d4a574]`}
                    >
                      ENTRY FEE
                    </h3>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-[#d4a574]/10 border border-[#d4a574]/30">
                    <span className="text-[#d4a574]/80 uppercase tracking-wider text-sm">
                      Amount Required
                    </span>
                    <span
                      className={`${unispace.className} text-3xl text-[#d4a574]`}
                    >
                      ₹{ORION_FEE}
                    </span>
                  </div>
                  <p className="text-[#d4a574]/40 text-xs font-mono">
                    * Transaction authorized by Team Leader only.
                  </p>
                </div>
              </RetroCard>
            </div>
          ) : (
            /* Has Team - Show Team Details & Payment */
            <div className="grid lg:grid-cols-2 gap-8">
              {/* LEFT: Team Details Card */}
              <RetroCard>
                <div className="flex flex-col gap-6">
                  <div className="flex justify-between items-start border-b border-[#d4a574]/20 pb-4">
                    <div className="overflow-hidden pr-4">
                      <h2
                        className={`${unispace.className} text-3xl text-[#d4a574] mb-1 truncate`}
                        title={team.name}
                      >
                        {team.name}
                      </h2>
                      <p className="text-[10px] text-[#d4a574]/40 font-mono tracking-widest">
                        ID: {team.$id}
                      </p>
                    </div>
                    <div className="shrink-0 px-3 py-1 bg-[#d4a574] text-black text-xs font-bold uppercase tracking-wider">
                      {team.members.length} / 3 UNITS
                    </div>
                  </div>

                  {/* Members List */}
                  <div className="flex flex-col gap-3">
                    {team.members.map((m: any) => (
                      <div
                        key={m.$id}
                        className="flex items-center justify-between p-3 bg-[#d4a574]/5 border border-[#d4a574]/20"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 flex items-center justify-center text-xs font-bold border border-[#d4a574] ${m.role === "LEADER" ? "bg-[#d4a574] text-black" : "text-[#d4a574]"}`}
                          >
                            {m.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#d4a574]">
                              {m.name}
                            </p>
                            <p className="text-xs text-[#d4a574]/50">
                              {m.email}
                            </p>
                          </div>
                        </div>
                        {m.role === "LEADER" && (
                          <Shield className="w-4 h-4 text-[#d4a574]" />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add Member Action (Leader Only) */}
                  {isLeader && !isTeamFull && (
                    <div className="mt-2 pt-4 border-t border-[#d4a574]/20 flex flex-col gap-3">
                      <Label className="text-xs text-[#d4a574]/60 uppercase tracking-widest">
                        Add Operative
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter email..."
                          value={newMemberEmail}
                          onChange={(e) => setNewMemberEmail(e.target.value)}
                          className="bg-black/50 border-[#d4a574]/30 text-[#d4a574] h-10 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#d4a574] rounded-none placeholder:text-[#d4a574]/20"
                        />
                        <Button
                          onClick={handleAddMember}
                          disabled={loading || !newMemberEmail}
                          size="sm"
                          className="bg-[#d4a574]/10 hover:bg-[#d4a574] text-[#d4a574] hover:text-black border border-[#d4a574] rounded-none transition-all duration-300"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </RetroCard>

              {/* RIGHT: Registration & Payment Card */}
              <RetroCard>
                <div className="flex flex-col gap-6 h-full">
                  <div className="flex items-center gap-4 border-b border-[#d4a574]/20 pb-4">
                    <CreditCard className="w-8 h-8 text-[#d4a574]" />
                    <h3
                      className={`${unispace.className} text-2xl text-[#d4a574]`}
                    >
                      REGISTRATION
                    </h3>
                  </div>

                  <div className="flex flex-col gap-4 flex-1 justify-center">
                    <div className="flex justify-between items-center p-4 bg-[#d4a574]/10 border border-[#d4a574]/30">
                      <span className="text-[#d4a574]/80 text-sm uppercase tracking-wider">
                        Fee Required
                      </span>
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
                        className="w-full bg-[#d4a574] text-black hover:bg-[#c49a6b] font-bold h-14 text-lg tracking-widest rounded-none mt-4 transition-all duration-300 hover:shadow-[0_0_15px_rgba(212,165,116,0.4)]"
                      >
                        {loading ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          "[ PAY_&_REGISTER ]"
                        )}
                      </Button>
                    ) : (
                      <div className="p-4 bg-yellow-900/20 border border-yellow-500/40 text-yellow-500 text-sm flex items-center gap-2 mt-4 font-mono">
                        <AlertCircle className="w-4 h-4" />
                        Awaiting Leader Authorization.
                      </div>
                    )}
                  </div>
                </div>
              </RetroCard>
            </div>
          )}

          {/* BOTTOM WIDE: Project Idea Section (Only if team exists) */}
          {team && (
            <RetroCard>
              <h3
                className={`${unispace.className} text-2xl mb-6 flex items-center gap-2 text-[#d4a574]`}
              >
                PROJECT_MANIFESTO{" "}
                <span className="text-red-500 animate-pulse">*</span>
              </h3>

              <div className="flex flex-col gap-4">
                <Textarea
                  placeholder="> Describe your innovation protocol... (Min 50 chars)"
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  disabled={!isLeader}
                  className="bg-black/80 border-[#d4a574]/30 min-h-[200px] text-[#d4a574] focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#d4a574] resize-none font-mono rounded-none placeholder:text-[#d4a574]/20 p-4 leading-relaxed"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-[#d4a574]/40 font-mono">
                    {isLeader
                      ? "> EDIT_ACCESS: GRANTED"
                      : "> EDIT_ACCESS: DENIED (LEADER_ONLY)"}
                  </p>
                  {isLeader && (
                    <Button
                      onClick={handleSaveIdea}
                      disabled={loading}
                      variant="outline"
                      className="border-[#d4a574] text-[#d4a574] bg-black hover:bg-[#d4a574] hover:text-black rounded-none tracking-widest"
                    >
                      [ SAVE_DATA ]
                    </Button>
                  )}
                </div>
              </div>
            </RetroCard>
          )}
        </div>
      </main>

      {/* CREATE TEAM MODAL */}
      <AnimatePresence>
        {showCreateTeam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black border border-[#d4a574] p-1 w-full max-w-md shadow-[0_0_30px_rgba(212,165,116,0.2)]"
            >
              <div className="bg-[#111] p-8 border border-[#d4a574]/20">
                <h2
                  className={`${unispace.className} text-2xl mb-2 text-[#d4a574]`}
                >
                  NEW_TEAM_PROTOCOL
                </h2>
                <p className="text-[#d4a574]/50 text-sm mb-6 font-mono">
                  Enter designation for new unit.
                </p>

                <Input
                  placeholder="UNIT_NAME"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="bg-black border-[#d4a574]/50 text-[#d4a574] mb-6 h-12 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#d4a574] font-mono tracking-wider"
                  autoFocus
                />

                <div className="flex gap-3 justify-end">
                  <Button
                    variant="ghost"
                    onClick={() => setShowCreateTeam(false)}
                    className="hover:bg-[#d4a574]/10 text-[#d4a574] transition-all duration-300 rounded-none"
                  >
                    ABORT
                  </Button>
                  <Button
                    onClick={handleCreateTeam}
                    disabled={loading}
                    className="bg-[#d4a574] text-black hover:bg-[#c49a6b] transition-all duration-300 rounded-none font-bold tracking-wider"
                  >
                    {loading ? "PROCESSING..." : "INITIALIZE"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
