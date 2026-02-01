"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type Registration = {
  $id: string;
  $createdAt: string;
  user: {
    name: string;
    email: string;
    phone?: string;
    college?: string;
    gender?: string;
  };
};

type Props = {
  registrations: Registration[];
  eventName: string;
  eventId: string;
};

export default function RegistrationsTableClient({
  registrations,
  eventName,
  eventId,
}: Props) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    try {
      // Define CSV headers
      const headers = [
        "Sl.No",
        "Name",
        "Email",
        "Phone",
        "College",
        "Gender",
        "Registered On",
        "Check-in Status",
      ];

      // Map data to rows
      const rows = registrations.map((reg, index) => [
        index + 1,
        `"${reg.user.name || ""}"`, // Quote strings to handle commas
        `"${reg.user.email || ""}"`,
        `"${reg.user.phone || ""}"`,
        `"${reg.user.college || ""}"`,
        `"${reg.user.gender || ""}"`,
        `"${new Date(reg.$createdAt).toLocaleString()}"`,
        "Pending", // Placeholder for now
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");

      // Create Blob
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${eventName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_registrations.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download CSV");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 md:p-6 w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href={`/admin/events/${eventId}`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4 text-white" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white break-words">
              {eventName}
            </h1>
            <p className="text-muted-foreground text-sm">
              Total: {registrations.length}
            </p>
          </div>
        </div>

        <Button
          onClick={handleDownload}
          disabled={downloading || registrations.length === 0}
          className="bg-blue-800 hover:bg-blue-900 text-white cursor-pointer"
        >
          <Download className="w-4 h-4 mr-2 " />
          {downloading ? "Exporting..." : "Download Excel"}
        </Button>
      </div>

      <div className="border rounded-lg bg-black/50 backdrop-blur-md border-white/10 w-full overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[70vh] md:max-h-none">
          <Table className="w-full">
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="w-[80px] text-white/70">Sl.No</TableHead>
                <TableHead className="text-white/70">Name</TableHead>
                <TableHead className="text-white/70">College</TableHead>
                <TableHead className="text-white/70 hidden md:table-cell">
                  Contact
                </TableHead>
                <TableHead className="text-white/70">Registered On</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.length > 0 ? (
                registrations.map((reg, index) => (
                  <TableRow
                    key={reg.$id}
                    className="border-white/10 hover:bg-white/5"
                  >
                    <TableCell className="font-medium text-white text-right">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-white">
                          {reg.user.name}
                        </span>
                        <span className="text-xs text-white/50">
                          {reg.user.gender || "N/A"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-white/80">
                      {reg.user.college || "N/A"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-col">
                        <span className="text-white/80">{reg.user.email}</span>
                        <span className="text-xs text-white/50">
                          {reg.user.phone || ""}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-white/80">
                      {new Date(reg.$createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-10 text-white/50"
                  >
                    No registrations found for this event.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
