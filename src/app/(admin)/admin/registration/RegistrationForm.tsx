"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/my_components/Toast";
import { processAdminRegistration, getEvents, getUserByEmail } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function RegistrationForm() {
  const { toast, success, error: errorToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [verifyingUser, setVerifyingUser] = useState(false);

  // Registration Data
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone: "",
    // New fields
    gender: "male",
    is_nitpy: false,
    college_name: "",

    type: "TICKET",
    quantity: 1,
    size: "M",
    event_id: "",
    hostel: "",
    day: "1",
    tier: "1",
    item_id: "TICKET_" + new Date().getTime(),
  });

  const [price, setPrice] = useState(0);

  const [userStatus, setUserStatus] = useState<{
    found: boolean;
    name?: string;
  } | null>(null);
  const [events, setEvents] = useState<
    { id: string; name: string; type: string; fee?: number }[]
  >([]);

  useEffect(() => {
    // Fetch events for Workshop dropdown
    getEvents().then(setEvents);
  }, []);

  // Calculate Price Effect
  useEffect(() => {
    let calculatedPrice = 0;
    const { type, quantity, tier, event_id } = formData;

    switch (type) {
      case "MERCH":
        calculatedPrice = 350 * quantity;
        break;
      case "ACCOMM":
        calculatedPrice = 350; // Fixed: 200 + 150 caution
        break;
      case "TICKET":
        if (tier === "1") calculatedPrice = 100;
        else if (tier === "2") calculatedPrice = 150;
        else if (tier === "3") calculatedPrice = 200;
        break;
      case "WORKSHOP":
        const event = events.find((e) => e.id === event_id);
        if (event && event.fee) {
          calculatedPrice = event.fee;
        }
        break;
    }
    setPrice(calculatedPrice);
  }, [
    formData.type,
    formData.quantity,
    formData.tier,
    formData.event_id,
    events,
  ]);

  const handleUserCheck = async () => {
    if (!formData.email) return;
    setVerifyingUser(true);
    const result = await getUserByEmail(formData.email);
    setVerifyingUser(false);

    if (result.found) {
      setUserStatus({ found: true, name: result.user?.name });
      success(`Registered as ${result.user?.name}`, "User Found");
    } else {
      setUserStatus({ found: false });
      toast({
        title: "New User",
        message: "User will be created. Please fill all details.",
        type: "info",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await processAdminRegistration({
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
        gender: formData.gender,
        is_nitpy: formData.is_nitpy,
        college_name: formData.college_name,

        type: formData.type as any,
        quantity: formData.quantity,
        size: formData.size,
        event_id: formData.event_id,
        hostel: formData.hostel,
        day: formData.day,
        tier: formData.tier as any,
        item_id: formData.item_id,
      });

      if (res.success) {
        success(
          `Transaction ID: ${res.data.transactionId}. Amount: ${res.data.amount}`,
          "Registration Successful",
        );
        // Reset sensitive fields
        setFormData((prev) => ({
          ...prev,
          email: "",
          name: "",
          phone: "",
          gender: "male",
          is_nitpy: false,
          college_name: "",
          item_id: "TICKET_" + new Date().getTime(),
        }));
        setUserStatus(null);
      } else {
        errorToast(res.error, "Registration Failed");
      }
    } catch (err) {
      console.error(err);
      errorToast("Something went wrong", "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const darkDropdownClass = "bg-black text-white border-white/20";

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Helpdesk Registration</span>
          <div className="text-xl font-bold bg-green-900/20 text-green-400 px-4 py-1 rounded border border-green-500/30">
            ₹{price}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Details Section */}
          <div className="space-y-4 border-b pb-4">
            <h3 className="font-semibold text-lg">User Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="user@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    onBlur={handleUserCheck}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleUserCheck}
                    disabled={verifyingUser}
                  >
                    {verifyingUser ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      "Check"
                    )}
                  </Button>
                </div>
              </div>

              {userStatus && !userStatus.found && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      required
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      required
                      placeholder="1234567890"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(val) => handleChange("gender", val)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className={darkDropdownClass}>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>NIT Py Student?</Label>
                    <div className="flex items-center gap-4 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="is_nitpy"
                          checked={formData.is_nitpy === true}
                          onChange={() => handleChange("is_nitpy", true)}
                          className="accent-primary w-4 h-4"
                        />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="is_nitpy"
                          checked={formData.is_nitpy === false}
                          onChange={() => handleChange("is_nitpy", false)}
                          className="accent-primary w-4 h-4"
                        />
                        <span>No</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>College Name</Label>
                    <Input
                      placeholder={
                        formData.is_nitpy ? "NIT Puducherry" : "College Name"
                      }
                      value={
                        formData.is_nitpy
                          ? "NIT Puducherry"
                          : formData.college_name
                      }
                      disabled={formData.is_nitpy}
                      onChange={(e) =>
                        handleChange("college_name", e.target.value)
                      }
                      required
                    />
                  </div>
                </>
              )}

              {userStatus?.found && (
                <div className="col-span-2 text-sm text-muted-foreground">
                  Account found:{" "}
                  <span className="font-bold text-primary">
                    {userStatus.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Registration Type Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Registration Type</h3>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(val) => handleChange("type", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent className={darkDropdownClass}>
                  <SelectItem value="TICKET">Ticket</SelectItem>
                  <SelectItem value="MERCH">Merch</SelectItem>
                  <SelectItem value="WORKSHOP">Workshop</SelectItem>
                  <SelectItem value="ACCOMM">Accommodation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* CONDITIONAL FIELDS */}

            {/* TICKET */}
            {formData.type === "TICKET" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tier</Label>
                  <Select
                    value={formData.tier}
                    onValueChange={(val) => handleChange("tier", val)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={darkDropdownClass}>
                      <SelectItem value="1">Tier 1 (Starts @ 100)</SelectItem>
                      <SelectItem value="2">Tier 2 (Starts @ 150)</SelectItem>
                      <SelectItem value="3">Tier 3 (Starts @ 200)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Item ID (Ref)</Label>
                  <Input
                    value="Auto-generated (ticket_userId)"
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    ID will be generated as ticket_userId upon registration.
                  </p>
                </div>
              </div>
            )}

            {/* MERCH */}
            {formData.type === "MERCH" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Size</Label>
                  <Select
                    value={formData.size}
                    onValueChange={(val) => handleChange("size", val)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={darkDropdownClass}>
                      <SelectItem value="S">S</SelectItem>
                      <SelectItem value="M">M</SelectItem>
                      <SelectItem value="L">L</SelectItem>
                      <SelectItem value="XL">XL</SelectItem>
                      <SelectItem value="XXL">XXL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min={1}
                    value={formData.quantity}
                    onChange={(e) =>
                      handleChange("quantity", parseInt(e.target.value))
                    }
                  />
                </div>
              </div>
            )}

            {/* WORKSHOP */}
            {formData.type === "WORKSHOP" && (
              <div className="space-y-2">
                <Label>Event/Workshop</Label>
                <Select
                  value={formData.event_id}
                  onValueChange={(val) => handleChange("event_id", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Workshop" />
                  </SelectTrigger>
                  <SelectContent className={darkDropdownClass}>
                    {events
                      .filter(
                        (e) => e.type === "WORKSHOP" || e.type === "HACKATHON",
                      )
                      .map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.name} {event.fee ? `(₹${event.fee})` : ""}
                        </SelectItem>
                      ))}
                    {events.length === 0 && (
                      <SelectItem value="custom" disabled>
                        No events found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* ACCOMM */}
            {formData.type === "ACCOMM" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hostel</Label>
                  <Input
                    placeholder="Hostel Name"
                    value={formData.hostel}
                    onChange={(e) => handleChange("hostel", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Day</Label>
                  <Select
                    value={formData.day}
                    onValueChange={(val) => handleChange("day", val)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={darkDropdownClass}>
                      <SelectItem value="1">Day 1</SelectItem>
                      <SelectItem value="2">Day 2</SelectItem>
                      <SelectItem value="3">Day 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                  Includes Caution Deposit (₹150) + Fee. Total approx ₹350.
                </div>
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              `Pay ₹${price} & Register`
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
