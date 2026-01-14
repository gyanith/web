
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const logs = [
    { id: 1, action: "User Login", user: "admin@gyanith.org", time: "2 mins ago", status: "Success" },
    { id: 2, action: "Payment Verified", user: "staff@gyanith.org", time: "1 hour ago", status: "Success" },
    { id: 3, action: "Event Created", user: "admin@gyanith.org", time: "2 hours ago", status: "Success" },
    { id: 4, action: "Failed Login", user: "unknown", time: "5 hours ago", status: "Failed" },
];

export default function LogsPage() {
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
                                <TableHead>User</TableHead>
                                <TableHead>Timestamp</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="font-medium">{log.action}</TableCell>
                                    <TableCell>{log.user}</TableCell>
                                    <TableCell>{log.time}</TableCell>
                                    <TableCell>
                                        <Badge variant={log.status === "Success" ? "default" : "destructive"}>
                                            {log.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}   