"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Calendar, User, Info, Activity } from "lucide-react";

interface Log {
  $id: string;
  action: string;
  description: string;
  user_id: string;
  type: string;
  $createdAt: string;
}

interface LogsClientProps {
  logs: Log[];
}

export default function LogsClient({ logs }: LogsClientProps) {
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "success";
      case "PENDING":
        return "secondary";
      case "FAILED":
        return "destructive";
      case "INFO":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <>
      <div className="rounded-md border bg-zinc-900 border-zinc-800 text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
              <TableHead className="text-zinc-400">Action</TableHead>
              <TableHead className="hidden lg:table-cell text-zinc-400">
                Description
              </TableHead>
              <TableHead className="hidden lg:table-cell text-zinc-400">
                User ID
              </TableHead>
              <TableHead className="hidden lg:table-cell text-zinc-400">
                Timestamp
              </TableHead>
              <TableHead className="text-zinc-400">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-zinc-500"
                >
                  No logs found.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow
                  key={log.$id}
                  className="border-zinc-800 hover:bg-zinc-800/50 cursor-pointer lg:cursor-default"
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      setSelectedLog(log);
                    }
                  }}
                >
                  <TableCell className="font-medium text-white truncate max-w-[150px] lg:max-w-none">
                    {log.action}
                  </TableCell>
                  <TableCell
                    className="hidden lg:table-cell text-zinc-300 max-w-[300px] truncate"
                    title={log.description}
                  >
                    {log.description}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs font-mono text-zinc-500">
                    {log.user_id || "-"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-zinc-400">
                    {new Date(log.$createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusColor(log.type) as any}
                      className="whitespace-nowrap text-white"
                    >
                      {log.type}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={!!selectedLog}
        onOpenChange={(open) => !open && setSelectedLog(null)}
      >
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-[90vw] sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#d4a574]">
              <Activity className="h-5 w-5" />
              Log Details
            </DialogTitle>
            <DialogDescription className="text-zinc-500">
              Detailed system activity information
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                  Action
                </label>
                <p className="text-lg font-medium text-white">
                  {selectedLog.action}
                </p>
                <Badge
                  variant={getStatusColor(selectedLog.type) as any}
                  className="text-white"
                >
                  {selectedLog.type}
                </Badge>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-1">
                  <Info className="h-3 w-3" /> Description
                </label>
                <p className="text-sm text-zinc-300 bg-zinc-900 p-3 rounded-lg border border-zinc-800 leading-relaxed">
                  {selectedLog.description}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-1">
                    <User className="h-3 w-3" /> User ID
                  </label>
                  <code className="text-xs bg-zinc-900 px-2 py-1 rounded block truncate border border-zinc-800 text-zinc-400">
                    {selectedLog.user_id || "System Action"}
                  </code>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Timestamp
                  </label>
                  <p className="text-sm text-zinc-400">
                    {new Date(selectedLog.$createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
