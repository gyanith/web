"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { verifyOrionAccess } from "@/lib/appwrite/orion-access";
import { createSessionClient } from "@/lib/appwrite/appwrite.server";
import { Models } from "node-appwrite";

// Components
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2, RefreshCcw, Eye } from "lucide-react";

// Server Actions
import { createAdminClient } from "@/lib/appwrite/appwrite.server";
import { appwriteConfig } from "@/lib/appwrite/appwrite.config";
import { Query } from "node-appwrite";
import { getOrionAdminData } from "@/lib/actions/orion.admin.actions";

interface OrionTeam extends Models.Document {
  name: string;
  leader_id: string;
  leaderName: string;
  leaderEmail: string;
  leaderPhone: string;
  orion_idea?: string;
  members?: any[];
  paymentStatus?: string;
}

export default function OrionAdminPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<OrionTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTeams: 0,
    totalMembers: 0,
    paidTeams: 0,
  });

  // Client-side access check is tricky, relying on server-side protection mainly or actions
  // But since this is a CLIENT component, we fetch data via a server action or API.
  // Let's implement fetch logic here invoking a server action or robustly fetching.
  // For simplicity, I'll use a direct useEffect fetcher if possible, or better, make this a SERVER component
  // but the user requested ShadCN UI which works best with Client Components for interactivity (Dialogs).
  // So Client Component that calls Server Actions to fetch data.

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      // We need a Server Action to fetch Admin Data securely
      // I'll create a quick inline fetcher or assume we have one.
      const res = await getOrionAdminData();

      if (res.success && res.teams) {
        setTeams(res.teams);
        setStats(res.stats);
      } else {
        // If unauthorized, redirect
        if (res.error === "Unauthorized") router.push("/");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-30 bg-black/95 backdrop-blur-sm border-b border-white/10 px-4 md:px-8 py-4">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Orion Admin
              </h1>
              <p className="text-white/50 text-sm mt-1">
                Manage Ideathon Teams
              </p>
            </div>
            <Button
              variant="default"
              size="icon"
              onClick={fetchTeams}
              className="shrink-0"
            >
              <RefreshCcw className="w-4 h-4 text-white" />
            </Button>
          </div>
          <div className="flex gap-6 items-center">
            <div>
              <p className="text-xs text-white/50">Total Teams</p>
              <p className="text-xl font-bold">{stats.totalTeams}</p>
            </div>
            <div>
              <p className="text-xs text-white/50">Paid Teams</p>
              <p className="text-xl font-bold text-green-400">
                {stats.paidTeams}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 md:px-8 py-6">
        <div className="bg-[#111] border border-white/10 rounded-lg overflow-hidden">
          <TooltipProvider>
            <Table className="w-full">
              <TableCaption>A list of registered Orion teams.</TableCaption>
              <TableHeader className="bg-white/5">
                <TableRow className="hover:bg-transparent border-white/10">
                  <TableHead className="text-white whitespace-nowrap">
                    Team Name
                  </TableHead>
                  <TableHead className="text-white whitespace-nowrap hidden md:table-cell">
                    Leader
                  </TableHead>
                  <TableHead className="text-white whitespace-nowrap hidden lg:table-cell">
                    Contact
                  </TableHead>
                  <TableHead className="text-white whitespace-nowrap hidden lg:table-cell">
                    Members
                  </TableHead>
                  <TableHead className="text-white whitespace-nowrap hidden md:table-cell">
                    Payment
                  </TableHead>
                  <TableHead className="text-white text-right whitespace-nowrap">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team) => (
                  <TableRow
                    key={team.$id}
                    className="hover:bg-white/5 border-white/10 transition-colors"
                  >
                    <TableCell className="font-medium text-blue-300 whitespace-nowrap">
                      {team.name}
                    </TableCell>
                    <TableCell className="max-w-[200px] hidden md:table-cell">
                      <div className="flex flex-col">
                        <span>{team.leaderName}</span>
                        <span className="text-xs text-white/40">
                          {team.leaderEmail}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap hidden lg:table-cell">
                      {team.leaderPhone}
                    </TableCell>
                    <TableCell className="min-w-[120px] hidden lg:table-cell">
                      <div className="flex -space-x-2">
                        {team.members?.map((m: any, i: number) => (
                          <Tooltip key={i}>
                            <TooltipTrigger asChild>
                              <div className="w-6 h-6 rounded-full text-black bg-white border border-white flex items-center justify-center text-[10px] font-bold cursor-pointer hover:bg-white/20 transition-colors">
                                {m.name.charAt(0)}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-[#1a1a1a] border border-white/20 text-white">
                              <div className="flex flex-col gap-0.5">
                                <span className="font-medium text-xs">
                                  {m.name}
                                </span>
                                <span className="text-[10px] text-white/60">
                                  {m.email}
                                </span>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap hidden md:table-cell">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${team.paymentStatus === "PAID" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
                      >
                        {team.paymentStatus || "PENDING"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-white text-white"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            <span className="hidden sm:inline">
                              View Details
                            </span>
                            <span className="sm:hidden">Details</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#0a0a0a] border-white/20 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-xl text-[#d4a574] mb-2">
                              {team.name}
                            </DialogTitle>
                            <DialogDescription className="text-white/50">
                              Team Details & Project Idea
                            </DialogDescription>
                          </DialogHeader>

                          <div className="flex flex-col gap-6 mt-4">
                            {/* Mobile Only Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-white/5 p-3 rounded border border-white/10">
                                <p className="text-xs text-white/40 uppercase mb-1">
                                  Leader
                                </p>
                                <p className="font-medium">{team.leaderName}</p>
                                <p className="text-sm text-white/60">
                                  {team.leaderEmail}
                                </p>
                                <p className="text-sm text-white/60">
                                  {team.leaderPhone}
                                </p>
                              </div>
                              <div className="bg-white/5 p-3 rounded border border-white/10">
                                <p className="text-xs text-white/40 uppercase mb-1">
                                  Status
                                </p>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-white/60">
                                    Payment:
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded text-xs font-bold ${team.paymentStatus === "PAID" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
                                  >
                                    {team.paymentStatus || "PENDING"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Members List */}
                            <div>
                              <p className="text-xs text-white/40 uppercase mb-2">
                                Team Members
                              </p>
                              <div className="space-y-2">
                                {team.members && team.members.length > 0 ? (
                                  team.members.map((m: any, i: number) => (
                                    <div
                                      key={i}
                                      className="flex items-center gap-3 bg-white/5 p-2 rounded border border-white/10"
                                    >
                                      <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs">
                                        {m.name.charAt(0)}
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium">
                                          {m.name}
                                        </p>
                                        <p className="text-xs text-white/60">
                                          {m.email}
                                        </p>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-sm text-white/40 italic">
                                    No members found
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Project Idea */}
                            <div>
                              <p className="text-xs text-white/40 uppercase mb-2">
                                Project Idea
                              </p>
                              <div className="p-4 bg-white/5 rounded border border-white/10 min-h-[100px] whitespace-pre-wrap text-sm leading-relaxed">
                                {team.orion_idea || (
                                  <span className="text-white/30 italic">
                                    No idea submitted yet.
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
