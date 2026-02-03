"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  User,
  Shield,
  FileText,
  Phone,
  LogOut,
  Terminal,
  Gamepad2,
  GraduationCap,
  QrCode,
  X,
} from "lucide-react";
import { QRCodeGenerator } from "@/lib/helpers/qrcode.helper";

import { unispace, blueScreen, garetBook } from "@/fonts/fonts";
import { signOut, getLoggedInUser } from "@/lib/actions/auth.actions";
import { contactDetails } from "@/data/info";
import {
  getCurrentUserDetails,
  getUserRegisteredEvents,
} from "@/lib/helpers/getUserData.helper";
import { TIERS } from "@/data/tiers";

const Page = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [registeredEvents, setRegisteredEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("account");
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const loggedInUser = await getLoggedInUser();
        setUser(loggedInUser);

        if (loggedInUser) {
          // Fetch detailed user info from 'users' collection
          const details = await getCurrentUserDetails(loggedInUser.$id);
          setUserDetails(details);

          // Fetch registered events
          const events = await getUserRegisteredEvents(loggedInUser.$id); // Assuming loggedInUser.$id is the userId used in registrations
          setRegisteredEvents(events);
        }
      } catch (err) {
        console.error("Failed to fetch user data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    await signOut();
    setUser(null);
    setUserDetails(null);
    setRegisteredEvents([]);
    setLoading(false);
    router.refresh();
  };

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black text-white">
        <span className={`${unispace.className} animate-pulse`}>
          INITIALIZING UPLINK...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-black text-white px-0 md:px-2 md:p-8 md:pt-32 relative overflow-x-hidden flex items-start md:items-end justify-center font-mono">
      {/* Background Grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "anticipate" }}
        className="relative z-10 flex flex-col md:flex-row w-full h-auto md:h-[80vh] min-h-[600px] bg-black/80 md:backdrop-blur-md md:border border-[#d4a574]/30 md:shadow-[0_0_50px_-10px_rgba(212,165,116,0.1)] overflow-hidden mb-20 md:mb-0"
      >
        {/* Sidebar */}
        <div className="w-full md:w-64 lg:w-72 bg-[#0a0a0a] border-b md:border-b-0 md:border-r border-[#d4a574]/20 flex flex-col p-4 md:p-6 shrink-0">
          <div
            className={`text-xl md:text-2xl md:mb-12 text-[#d4a574] tracking-widest ${blueScreen.className} border-b border-[#d4a574]/20 pb-4 text-center md:text-left`}
          >
            SYSTEM_SETTINGS
          </div>

          <nav className="flex flex-row md:flex-col gap-1 justify-between md:justify-start pb-2 md:pb-0">
            <SidebarItem
              icon={<User size={18} />}
              label="PROFILE"
              active={activeTab === "account"}
              onClick={() => setActiveTab("account")}
            />
            {/* Divider */}
            <div className="hidden md:block h-px bg-[#d4a574]/10 my-4 mx-2" />

            <SidebarItem
              icon={<Shield size={18} />}
              label="PRIVACY"
              onClick={() => router.push("/privacy-policy")}
            />
            <SidebarItem
              icon={<FileText size={18} />}
              label="TERMS"
              onClick={() => router.push("/terms-and-conditions")}
            />
            <SidebarItem
              icon={<Phone size={18} />}
              label="CONTACT"
              active={activeTab === "contacts"}
              onClick={() => setActiveTab("contacts")}
            />
          </nav>

          <button
            onClick={handleLogout}
            className={`hidden md:flex items-center gap-3 px-4 py-4 text-red-500 hover:bg-red-900/10 border border-transparent hover:border-red-500/30 transition-all mt-auto ${unispace.className}`}
          >
            <LogOut size={16} />
            <span className="text-sm tracking-widest">TERMINATE_SESSION</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10 lg:p-12 scrollbar-thin scrollbar-thumb-[#d4a574]/20 scrollbar-track-black w-full">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex flex-row items-start md:items-center justify-between mb-8 md:mb-12 border-b border-white/10 pb-6 gap-4">
              <div className="w-full">
                <h1
                  className={`text-2xl md:text-4xl ${blueScreen.className} text-white mb-2 break-words`}
                >
                  {activeTab === "contacts"
                    ? "COMM_DIRECTORY"
                    : "OPERATOR_DETAILS"}
                </h1>
                <p
                  className={`text-[#d4a574] text-[10px] md:text-xs tracking-[0.2em] ${unispace.className} break-all`}
                >
                  {activeTab === "contacts"
                    ? "SECURE_CHANNEL_LIST"
                    : `ID: ${user?.$id || "UNKNOWN_ENTITY"}`}
                </p>
              </div>

              {/* Initials Avatar + Tier Badge - Sharp (Only show on Account tab) */}
              {activeTab === "account" && user && (
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button
                    onClick={() => setShowQrModal(true)}
                    className="w-16 h-16 bg-[#d4a574] text-black flex items-center justify-center border-2 border-white/20 shadow-[0_0_20px_rgba(212,165,116,0.5)] hover:bg-[#b88654] transition-colors"
                  >
                    <QrCode size={32} />
                  </button>
                  {/* Tier Badge */}
                  {userDetails?.tier && (
                    <div
                      className={`px-3 py-1 text-[10px] md:text-xs font-bold tracking-widest ${unispace.className} ${
                        userDetails.tier === 3
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                          : userDetails.tier === 2
                            ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                            : "bg-gradient-to-r from-amber-700 to-orange-700 text-white"
                      } border border-white/20 shadow-lg`}
                    >
                      {TIERS.find((t) => t.tier === userDetails.tier)?.title ||
                        "TIER"}
                    </div>
                  )}
                  {!userDetails?.tier && (
                    <div
                      className={`px-3 py-1 text-[10px] md:text-xs font-bold tracking-widest ${unispace.className} bg-zinc-800 text-zinc-500 border border-white/10`}
                    >
                      NO TIER
                    </div>
                  )}
                </div>
              )}
            </div>

            {activeTab === "account" ? (
              <motion.div
                key="account-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, staggerChildren: 0.1 }}
              >
                {/* Basic Info Section */}
                <Section title="IDENTITY_MATRIX" delay={0.1}>
                  <div className="grid gap-px bg-white/5 border border-white/5 w-full">
                    {/* Display real user details if available, else fall back to auth user data or N/A */}
                    <InfoRow
                      label="DISPLAY_NAME"
                      value={userDetails?.name || user?.name || "N/A"}
                    />
                    <InfoRow
                      label="LINK_ADDRESS"
                      value={userDetails?.email || user?.email || "N/A"}
                    />
                    <InfoRow
                      label="COMM_FREQUENCY"
                      value={userDetails?.phone || user?.phone || "N/A"}
                    />
                    <InfoRow
                      label="BIOLOGICAL_ID"
                      value={userDetails?.gender || user?.gender || "N/A"}
                    />
                    <InfoRow
                      label="AFFILIATION_HUB"
                      value={userDetails?.college_name || "N/A"}
                    />
                  </div>
                </Section>

                {/* Registered Events Section */}
                <Section title="ACTIVE_MISSIONS" delay={0.2}>
                  {registeredEvents.length > 0 ? (
                    <div className="space-y-2">
                      {registeredEvents.map((event, idx) => {
                        const type = (event.type || "tech").toUpperCase();
                        let Icon = Terminal;
                        let color = "text-[#d4a574]";
                        let borderColor = "border-[#d4a574]";

                        if (type === "WORKSHOP") {
                          Icon = GraduationCap;
                          color = "text-cyan-400";
                          borderColor = "border-cyan-400";
                        } else if (type === "FUN") {
                          Icon = Gamepad2;
                          // Tech and Fun share accent
                        }

                        return (
                          <div
                            key={idx}
                            onClick={() =>
                              router.push(
                                `/events/${event.type || "tech"}/${event.id}`,
                              )
                            }
                            className={`flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-[#111] border-l-2 ${borderColor} hover:bg-[#1a1a1a] transition-colors gap-2 cursor-pointer`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={color}>
                                <Icon size={18} />
                              </div>
                              <div>
                                <div
                                  className={`font-bold text-white ${unispace.className} text-sm`}
                                >
                                  {event.name}
                                </div>
                                <div className="text-xs text-white/40 font-mono mt-1">
                                  {new Date(event.date).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    },
                                  )}
                                </div>
                              </div>
                            </div>
                            <span
                              className={`text-[10px] uppercase tracking-wider ${unispace.className} text-green-500 self-end md:self-auto`}
                            >
                              [CONFIRMED]{" "}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-6 md:p-8 border border-white/10 bg-white/5 flex flex-col items-center justify-center text-center">
                      <div
                        className={`text-[#d4a574]/50 mb-4 ${unispace.className} text-xs md:text-sm tracking-widest`}
                      >
                        NO_ACTIVE_MISSIONS_DETECTED
                      </div>
                      <button
                        onClick={() => router.push("/events")}
                        className="px-6 py-2 border border-[#d4a574] text-[#d4a574] hover:bg-[#d4a574] hover:text-black transition-all text-[10px] md:text-xs font-bold tracking-widest uppercase truncate max-w-full"
                      >
                        INITIATE_SEARCH &gt;
                      </button>
                    </div>
                  )}
                </Section>
              </motion.div>
            ) : (
              /* CONTACTS TAB CONTENT */
              <motion.div
                key="contacts-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 gap-8"
              >
                {Object.entries(contactDetails).map(
                  ([teamName, members], idx) => (
                    <TeamGroup
                      key={teamName}
                      teamName={teamName}
                      members={members}
                      index={idx}
                    />
                  ),
                )}
              </motion.div>
            )}

            {/* Mobile Logout Button */}
            <button
              onClick={handleLogout}
              className={`md:hidden w-full flex items-center justify-center gap-3 px-4 py-4 text-red-500 border border-red-500/30 bg-red-900/10 mt-8 mb-4 ${unispace.className}`}
            >
              <LogOut size={16} />
              <span className="text-sm tracking-widest">TERMINATE_SESSION</span>
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showQrModal && user && (
          <QrModal
            open={showQrModal}
            onClose={() => setShowQrModal(false)}
            userId={user.$id}
            userName={user.name}
            onLogout={handleLogout}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Sub-components
function SidebarItem({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: any;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
                flex items-center justify-center md:justify-start 
                px-4 py-3 md:px-4 md:py-3
                w-auto md:w-full
                border-b-2 md:border-b-0 md:border-l-2 transition-all duration-200 group
                ${
                  active
                    ? "border-[#d4a574] text-[#d4a574] bg-[#d4a574]/10 md:bg-transparent" // Added bg highlight for mobile active
                    : "border-transparent text-gray-500 hover:text-white"
                }
            `}
      title={label} // Tooltip for mobile since text is hidden
    >
      <div className="flex items-center gap-0 md:gap-3">
        {icon}
        <span
          className={`hidden md:block text-[10px] md:text-xs tracking-wider ${unispace.className}`}
        >
          {label}
        </span>
      </div>
      {active && (
        <div className="hidden md:block w-1.5 h-1.5 bg-[#d4a574] animate-pulse ml-auto" />
      )}
    </button>
  );
}

function Section({
  title,
  children,
  delay = 0,
}: {
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: delay, duration: 0.4 }}
      className="mb-8 md:mb-12 last:mb-0 w-full"
    >
      <div className="flex items-center gap-2 mb-4 md:mb-6">
        <div className="w-1 h-3 md:h-4 bg-[#d4a574]" />
        <h2
          className={`text-xs md:text-sm text-white/70 tracking-[0.2em] ${unispace.className}`}
        >
          {title}
        </h2>
      </div>
      {children}
    </motion.div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between p-3 md:p-4 bg-black/40 hover:bg-[#d4a574]/5 transition-colors group w-full break-words">
      <span className="text-[#666] text-[10px] md:text-xs font-mono uppercase tracking-wide mb-1 md:mb-0 shrink-0">
        {label}
      </span>
      <span
        className={`text-white text-xs md:text-sm ${garetBook.className} text-left md:text-right break-all`}
      >
        {value}
      </span>
    </div>
  );
}

const QrModal = ({
  open,
  onClose,
  userId,
  userName,
  onLogout,
}: {
  open: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  onLogout: () => void;
}) => {
  if (!open) return null;

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[200] flex flex-col bg-[#ff4600] max-w-md  text-black overflow-hidden font-sans"
    >
      {/* Top Bar */}
      <div className="flex justify-between items-start p-6 pt-12 md:p-8">
        <div>
          <p className="font-bold text-sm tracking-wide mb-1">YOUR PASS</p>
          <p className="text-xs opacity-60 font-medium">Valid for GYANITH 26</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center -mt-10 px-6">
        <h1 className="font-black text-5xl md:text-7xl tracking-tighter leading-none text-center mb-2 uppercase">
          GYANITH <br /> 2026
        </h1>
        <p className="font-medium text-sm md:text-lg tracking-widest uppercase mb-10 opacity-80">
          INSPIRE . INNOVATE . INVENT
        </p>

        <div className="relative p-4 bg-white/20 backdrop-blur-sm rounded-xl">
          {/* QR Code */}
          <div className="relative">
            <QRCodeGenerator
              value={userId}
              size={256}
              bgColor="transparent"
              fgColor="#000000"
              className="w-64 h-64 md:w-80 md:h-80 opacity-90"
            />
            {/* Center Logo/Icon Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/*  <div className="w-10 h-10 bg-black rounded-full" /> */}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <h2 className="font-bold text-2xl uppercase tracking-tight">
            {userName || "USER"}
          </h2>
          <p className="text-xs font-mono opacity-60 mt-1 uppercase tracking-wider">
            {userId}
          </p>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 pb-12 md:p-10 flex gap-4">
        <button
          onClick={onClose}
          className="w-full h-14 bg-black text-[#ff4600] font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-2xl transition-all"
        >
          Close
        </button>
      </div>

      {/* Close Button (Absolute) */}
    </motion.div>
  );
};

function TeamGroup({
  teamName,
  members,
  index,
}: {
  teamName: string;
  members: { name: string; contact: string }[];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="w-full flex flex-col gap-4"
    >
      {/* Team Header */}
      <div
        className={`text-[#d4a574] text-sm md:text-lg uppercase tracking-widest border-b border-[#d4a574]/30 pb-2 ${unispace.className}`}
      >
        {teamName}
      </div>

      {/* Members List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {members.map((member, i) => (
          <div
            key={i}
            className="flex items-center justify-between bg-[#111] border border-white/5 p-4 hover:border-[#d4a574]/50 transition-colors group"
          >
            <div className="flex flex-col">
              <span className="text-white font-bold text-sm md:text-base tracking-wide">
                {member.name}
              </span>
              <span className="text-white/40 text-[10px] md:text-xs mt-1">
                {" "}
                COORDINATOR{" "}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={`tel:${member.contact}`}
                className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-[#222] text-[#d4a574] hover:bg-[#d4a574] hover:text-black transition-all"
                aria-label={`Call ${member.name}`}
              >
                <Phone size={16} />
              </a>
              <span
                className={`${unispace.className} text-[10px] md:text-xs text-white/60 tracking-wider hidden sm:block`}
              >
                {member.contact}
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default Page;
