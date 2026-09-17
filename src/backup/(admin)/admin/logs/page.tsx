import { getLogs } from "@/backup/lib/actions/logs.actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import LogsClient from "./LogsClient";

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
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl text-white">
          System Logs
        </h1>
        <div className="text-sm text-muted-foreground">Total Logs: {total}</div>
      </div>

      <LogsClient logs={logs as any} />

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
