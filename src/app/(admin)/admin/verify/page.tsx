"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScanLine, Search, CheckCircle2 } from "lucide-react";

async function verifyPayment(payload: {
  qrData: string;
  category: "event" | "accommodation" | "merch";
}) {
  // TODO: verify payment and mark as paid
  console.log("Verifying...", payload);
}

export default function VerifyPaymentsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
         <h1 className="text-lg font-semibold md:text-2xl">Payment Verification</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Scan QR Code</CardTitle>
            <CardDescription>
              Use the camera to scan the attendee's payment QR code.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 py-6">
            <div className="relative flex aspect-square w-full max-w-[300px] items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/50">
              <ScanLine className="h-16 w-16 text-muted-foreground animate-pulse" />
              <span className="absolute bottom-4 text-xs text-muted-foreground">
                Camera Active
              </span>
            </div>
            <Button className="w-full max-w-[300px]">
              <ScanLine className="mr-2 h-4 w-4" /> Start Scanning
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manual Entry</CardTitle>
            <CardDescription>
              Enter the transaction ID or Booking ID manually.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="id" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="id">Booking ID</TabsTrigger>
                <TabsTrigger value="phone">Phone Number</TabsTrigger>
              </TabsList>
              <div className="mt-6 space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="input-id">Enter ID / Number</Label>
                  <div className="flex gap-2">
                    <Input id="input-id" placeholder="GY-2024-..." />
                    <Button size="icon">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="rounded-lg border p-4 bg-muted/50">
                   <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      payment status will appear here
                   </div>
                </div>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
