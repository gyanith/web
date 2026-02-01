"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Copy,
  LogOut,
  Trash2,
  Users,
  Plus,
  ArrowRight,
  Shield,
  X,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { unispace, garetBook, creatoDisplay } from "@/fonts/fonts";
import { useToast } from "@/my_components/Toast";
import {
  createTeam,
  joinTeam,
  leaveTeam,
  deleteTeam,
} from "@/lib/actions/team.actions";
import Footer from "@/my_components/Footer";

interface TeamMember {
  $id: string;
  name: string;
  email: string;
  role: "leader" | "member";
  user_id: string;
}

interface TeamData {
  $id: string;
  name?: string;
  leader_id: string;
  members: TeamMember[];
}

interface TeamClientProps {
  initialTeam: TeamData | null;
  eventId: string;
  userId: string;
  eventType: string;
  isRegistered: boolean;
}

export default function TeamClient({
  initialTeam,
  eventId,
  userId,
  eventType,
  isRegistered,
}: TeamClientProps) {
  const router = useRouter();
  const toast = useToast();
  const [team, setTeam] = useState<TeamData | null>(initialTeam);
  const [loading, setLoading] = useState(false);
  const [joinTeamId, setJoinTeamId] = useState("");

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");

  // Sync state with props when router.refresh() updates initialTeam
  useEffect(() => {
    setTeam(initialTeam);
  }, [initialTeam]);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      toast.error("Please enter a team name");
      return;
    }

    setLoading(true);
    try {
      const result = await createTeam(eventId, userId, newTeamName);
      if (result.success) {
        toast.success("Team created successfully!");
        setShowCreateModal(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to create team");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async () => {
    if (!joinTeamId.trim()) {
      toast.error("Please enter a Team ID");
      return;
    }
    setLoading(true);
    try {
      const result = await joinTeam(joinTeamId, userId, eventId);
      if (result.success) {
        toast.success("Joined team successfully!");
        router.refresh(); // This will re-fetch data and likely redirect or update state depending on parent implementation
        // Since we don't fetch the new team data here manually, we rely on the page refresh.
        // But for better UX, we could fetch it.
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Team not found or request failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveTeam = async () => {
    setLoading(true);
    try {
      if (!team) return;
      const result = await leaveTeam(team.$id, userId);
      if (result.success) {
        toast.success("Left team successfully");
        setShowLeaveModal(false);
        setTeam(null);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to leave team");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async () => {
    setLoading(true);
    try {
      if (!team) return;
      const result = await deleteTeam(team.$id, userId);
      if (result.success) {
        toast.success("Team deleted successfully");
        setShowDeleteModal(false);
        setTeam(null);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to delete team");
    } finally {
      setLoading(false);
    }
  };

  const copyTeamId = () => {
    if (team) {
      navigator.clipboard.writeText(team.$id);
      toast.success("Team ID copied to clipboard");
    }
  };

  // ----------------------------------------------------------------------
  // VIEW: JOINED TEAM
  // ----------------------------------------------------------------------
  if (team) {
    const isLeader = team.leader_id === userId;

    return (
      <div className="min-h-screen w-full flex flex-col text-white relative">
        {/* Back Button - Fixed or Absolute depending on scroll preference. Absolute inside relative container scrolls with content. */}
        <button
          onClick={() => router.push(`/events/${eventType}/${eventId}`)}
          className="absolute top-8 left-8 flex items-center gap-2 text-white/50 hover:text-[#d4a574] transition-colors z-20"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className={`${unispace.className} text-sm`}>BACK TO EVENT</span>
        </button>

        <div className="flex-1 flex flex-col items-center justify-center p-6 pt-32 w-full max-w-7xl mx-auto z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-[#d4a574]/30 bg-[#0a0a0a] p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-2 h-full bg-[#d4a574]" />

            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
              <div>
                <h1
                  className={`${creatoDisplay.className} text-4xl md:text-6xl text-[#d4a574] mb-2 uppercase tracking-wide`}
                >
                  {team.name || "YOUR TEAM"}
                </h1>
                <div
                  className="flex items-center gap-3 bg-white/5 p-3 pr-4 border border-white/10 group cursor-pointer w-fit"
                  onClick={copyTeamId}
                >
                  <code className={`${unispace.className} text-white/70`}>
                    {team.$id}
                  </code>
                  <Copy className="w-4 h-4 text-[#d4a574] opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
                <p
                  className={`text-xs text-white/40 mt-2 ${garetBook.className}`}
                >
                  SHARE ID TO INVITE MEMBERS
                </p>
              </div>

              <div className="flex gap-4">
                {isLeader ? (
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    disabled={loading}
                    className="flex items-center gap-2 border border-red-500/50 bg-red-900/10 hover:bg-red-900/30 text-red-400 px-6 py-3 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className={unispace.className}>DELETE TEAM</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowLeaveModal(true)}
                    disabled={loading}
                    className="flex items-center gap-2 border border-red-500/50 bg-red-900/10 hover:bg-red-900/30 text-red-400 px-6 py-3 transition-colors disabled:opacity-50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className={unispace.className}>LEAVE TEAM</span>
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h2
                className={`${unispace.className} text-xl text-white/80 border-b border-white/10 pb-2`}
              >
                MEMBERS
              </h2>
              <div className="grid gap-4">
                {team.members.map((member) => (
                  <div
                    key={member.$id}
                    className="flex items-center justify-between p-4 bg-[#d4a574] text-black w-full shadow-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 flex items-center justify-center border border-black/20 bg-black/10 text-black`}
                      >
                        {member.role === "leader" ? (
                          <Shield className="w-5 h-5" />
                        ) : (
                          <Users className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p
                          className={`${unispace.className} text-lg font-bold uppercase`}
                        >
                          {member.name || "Unknown User"}
                        </p>
                        <p
                          className={`text-xs text-black/60 ${garetBook.className}`}
                        >
                          {member.email || "No Email"}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`${unispace.className} text-xs px-3 py-1 border border-black/20 text-black font-bold uppercase tracking-wider`}
                    >
                      {member.role}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* DELETE CONFIRMATION MODAL */}
        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-md bg-[#0a0a0a] border border-[#d4a574]/30 p-6 shadow-2xl relative"
              >
                <h2 className={`text-xl text-white mb-4 ${unispace.className}`}>
                  Delete Team?
                </h2>
                <p className="text-white/60 mb-8">
                  Are you sure you want to delete this team? All members will be
                  removed. This action cannot be undone.
                </p>

                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 text-sm text-white/40 hover:text-white transition-colors"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={handleDeleteTeam}
                    className="px-6 py-2 bg-red-500 hover:bg-red-400 text-black font-bold uppercase tracking-wider"
                  >
                    {loading ? "Deleting..." : "Delete Team"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LEAVE CONFIRMATION MODAL */}
        <AnimatePresence>
          {showLeaveModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-md bg-[#0a0a0a] border border-[#d4a574]/30 p-6 shadow-2xl relative"
              >
                <h2 className={`text-xl text-white mb-4 ${unispace.className}`}>
                  Leave Team?
                </h2>
                <p className="text-white/60 mb-8">
                  Are you sure you want to leave this team?
                </p>

                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setShowLeaveModal(false)}
                    className="px-4 py-2 text-sm text-white/40 hover:text-white transition-colors"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={handleLeaveTeam}
                    className="px-6 py-2 bg-red-500 hover:bg-red-400 text-black font-bold uppercase tracking-wider"
                  >
                    {loading ? "Leaving..." : "Leave Team"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <Footer />
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // VIEW: NO TEAM (JOIN / CREATE)
  // ----------------------------------------------------------------------
  return (
    <div className="min-h-screen w-full flex flex-col bg-black text-white relative">
      {/* Back Button */}
      <button
        onClick={() => router.push(`/events/${eventType}/${eventId}`)}
        className="absolute top-8 left-8 flex items-center gap-2 text-white/50 hover:text-[#d4a574] transition-colors z-20"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className={`${unispace.className} text-sm`}>BACK TO EVENT</span>
      </button>

      <div className="flex-1 flex flex-col items-center justify-center w-full z-10 p-6 pt-32">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
          {!isRegistered ? (
            <div className="col-span-1 md:col-span-2 border border-red-500/30 bg-red-900/10 p-8 flex flex-col items-center justify-center text-center gap-4">
              <h2 className={`${unispace.className} text-2xl text-red-500`}>
                REGISTRATION REQUIRED
              </h2>
              <p className="text-white/60 max-w-lg">
                You must register for this event before you can create or join a
                team. Please return to the event page and complete your
                registration.
              </p>
              <button
                onClick={() => router.push(`/events/${eventType}/${eventId}`)}
                className="mt-4 px-6 py-3 bg-red-500 hover:bg-red-400 text-black font-bold uppercase tracking-wider transition-colors"
              >
                GO TO REGISTRATION
              </button>
            </div>
          ) : (
            <>
              {/* CREATE TEAM */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="border border-[#d4a574]/30 bg-[#0a0a0a] p-8 flex flex-col justify-between"
              >
                <div>
                  <h2
                    className={`${unispace.className} text-2xl text-[#d4a574] mb-4`}
                  >
                    CREATE TEAM
                  </h2>
                  <p className="text-white/60 mb-8">
                    Start a new team and become the leader. Share your Team ID
                    to invite others.
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 border border-[#d4a574] bg-[#d4a574]/10 hover:bg-[#d4a574] hover:text-black py-4 transition-all group disabled:opacity-50"
                >
                  <Plus className="w-5 h-5" />
                  <span className={`${unispace.className} text-lg`}>
                    CREATE NEW TEAM
                  </span>
                </button>
              </motion.div>

              {/* JOIN TEAM */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="border border-white/20 bg-[#0a0a0a] p-8 flex flex-col justify-between relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 -rotate-45 transform translate-x-10 -translate-y-10" />

                <div>
                  <h2
                    className={`${unispace.className} text-2xl text-white mb-4`}
                  >
                    JOIN TEAM
                  </h2>
                  <p className="text-white/60 mb-8">
                    Have a Team ID? Enter it below to join an existing team.
                  </p>

                  <input
                    type="text"
                    placeholder="ENTER TEAM ID"
                    value={joinTeamId}
                    onChange={(e) => setJoinTeamId(e.target.value)}
                    className={`w-full bg-black border border-white/20 p-4 text-white placeholder:text-white/30 focus:border-[#d4a574] focus:outline-none transition-colors mb-4 ${unispace.className}`}
                    disabled={loading}
                  />
                </div>

                <button
                  onClick={handleJoinTeam}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 border border-white/30 hover:bg-white hover:text-black py-4 transition-all group disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  )}
                  <span className={`${unispace.className} text-lg`}>
                    {loading ? "SEARCHING..." : "JOIN TEAM"}
                  </span>
                </button>
              </motion.div>
            </>
          )}
        </div>
      </div>

      {/* CREATE TEAM MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-[#0a0a0a] border border-[#d4a574]/30 p-6 shadow-2xl relative"
            >
              <h2 className={`text-xl text-white mb-4 ${unispace.className}`}>
                Create Team
              </h2>
              <p className="text-white/60 mb-4">
                Enter a name for your new team.
              </p>

              <input
                type="text"
                placeholder="Team Name"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                className={`w-full bg-black border border-white/20 p-3 text-white placeholder:text-white/30 focus:border-[#d4a574] focus:outline-none transition-colors mb-6 ${unispace.className}`}
                disabled={loading}
                autoFocus
              />

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm text-white/40 hover:text-white transition-colors"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleCreateTeam}
                  className="px-6 py-2 bg-[#d4a574] hover:bg-[#d4a574]/80 text-black font-bold uppercase tracking-wider"
                >
                  {loading ? "Creating..." : "Create Team"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
}
