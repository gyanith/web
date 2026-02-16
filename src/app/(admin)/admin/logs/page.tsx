import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getLogs } from "@/lib/actions/logs.actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const LIMIT = 20;

  const { logs, total } = await getLogs({ page, limit: LIMIT });
  const totalPages = Math.ceil(total / LIMIT);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "default"; // Black/White
      case "PENDING":
        return "secondary"; // Gray
      case "FAILED":
        return "destructive"; // Red
      case "INFO":
        return "outline"; // Outline
      default:
        return "secondary";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl text-white">
          System Logs
        </h1>
        <div className="text-sm text-muted-foreground">Total Logs: {total}</div>
      </div>

      <div className="rounded-md border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead className="max-w-[300px]">Description</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No logs found.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log: any) => (
                  <TableRow key={log.$id}>
                    <TableCell className="font-medium">{log.action}</TableCell>
                    <TableCell
                      className="max-w-[300px] truncate"
                      title={log.description}
                    >
                      {log.description}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {log.user_id || "-"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(log.$createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(log.type) as any}>
                        {log.type}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page {page} of {totalPages || 1}
        </div>
        <div className="flex items-center gap-2 text-white">
          <Button variant="outline" size="sm" asChild disabled={page <= 1}>
            {page <= 1 ? (
              <span className="flex text-white items-center gap-2 pointer-events-none opacity-50">
                <ChevronLeft className="h-4 w-4" /> Previous
              </span>
            ) : (
              <Link
                href={`/admin/logs?page=${page - 1}`}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4 text-white" /> Previous
              </Link>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            asChild
            disabled={page >= totalPages}
          >
            {page >= totalPages ? (
              <span className="flex text-white items-center gap-2 pointer-events-none opacity-50">
                Next <ChevronRight className="h-4 w-4" />
              </span>
            ) : (
              <Link
                href={`/admin/logs?page=${page + 1}`}
                className="flex items-center gap-2"
              >
                Next <ChevronRight className="h-4 w-4 text-white" />
              </Link>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
