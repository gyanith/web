"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Download } from "lucide-react";
import {
  getAccommodationExportData,
  AccommodationExportRow,
} from "./export.actions";
import { useToast } from "@/my_components/Toast";

const HOSTELS = ["ALL", "BHARANI", "BHAVANI"];

function rowsToCsv(rows: AccommodationExportRow[]): string {
  const headers = [
    "Name",
    "Email",
    "Phone",
    "College",
    "Hostel",
    "Days",
    "No. of Days",
  ];
  const escape = (v: string | number) => {
    const s = String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [r.name, r.email, r.phone, r.college, r.hostel, r.days, r.num_days]
        .map(escape)
        .join(","),
    ),
  ];
  return lines.join("\n");
}

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }); // BOM for Excel
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AccommodationExport() {
  const [hostel, setHostel] = useState<string>("ALL");
  const [loading, setLoading] = useState(false);
  const { error: errorToast } = useToast();

  const handleExport = async () => {
    setLoading(true);
    try {
      const allRows = await getAccommodationExportData();
      const filtered =
        hostel === "ALL" ? allRows : allRows.filter((r) => r.hostel === hostel);

      if (filtered.length === 0) {
        errorToast("No records found for the selected hostel", "Empty Export");
        return;
      }

      const csv = rowsToCsv(filtered);
      const filename =
        hostel === "ALL"
          ? "accommodation_all.csv"
          : `accommodation_${hostel.toLowerCase()}.csv`;
      downloadCsv(csv, filename);
    } catch (err) {
      console.error(err);
      errorToast("Failed to export data", "Export Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Hostel selector */}
      <Select value={hostel} onValueChange={setHostel}>
        <SelectTrigger className="w-40 bg-black text-white border-white/20">
          <SelectValue placeholder="Select Hostel" />
        </SelectTrigger>
        <SelectContent className="bg-black text-white border-white/20">
          {HOSTELS.map((h) => (
            <SelectItem key={h} value={h} className="text-white">
              {h === "ALL" ? "All Hostels" : h}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Export button */}
      <Button
        variant="outline"
        className="border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/20"
        onClick={handleExport}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        {loading ? "Exporting…" : "Export CSV"}
      </Button>
    </div>
  );
}
