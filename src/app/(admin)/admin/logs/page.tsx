import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { appwriteConfig } from "@/lib/appwrite/appwrite.config";
import { createAdminClient } from "@/lib/appwrite/appwrite.server";
import { Query } from "node-appwrite";

export const dynamic = "force-dynamic";

async function getLogs() {
  try {
    const { getTablesDB } = await createAdminClient();
    const tablesDB = getTablesDB();

    const response = await tablesDB.listRows(
      appwriteConfig.databaseId,
      appwriteConfig.logsCollectionId,
      [
        Query.orderDesc("$createdAt"), // Latest first
        Query.limit(100),
      ],
    );
    return response.rows;
  } catch (error) {
    console.error("Failed to fetch logs:", error);
    return [];
  }
}

export default async function LogsPage() {
  const logs = await getLogs();

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
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">System Logs</h1>
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
                logs.map((log) => (
                  <TableRow key={log.$id}>
                    <TableCell className="font-medium">{log.action}</TableCell>
                    <TableCell
                      className="max-w-[300px] truncate"
                      title={log.description}
                    >
                      {log.description}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {log.userId || "-"}
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
    </div>
  );
}
