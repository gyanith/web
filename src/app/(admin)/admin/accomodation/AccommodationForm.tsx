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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/my_components/Toast";
import {
  processAdminRegistration,
  getUserByEmail,
} from "../registration/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// @ts-ignore
import { load } from "@cashfreepayments/cashfree-js";

export default function AccommodationForm() {
  const { toast, success, error: errorToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [verifyingUser, setVerifyingUser] = useState(false);

  // Registration Data
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone: "",
    // New fields
    password: "", // Added password
    gender: "male",
    is_nitpy: false,
    college_name: "",

    type: "ACCOMM", // Fixed
    quantity: 1,
    size: "M", // defaults to fill required type payload
    event_id: "",
    hostel: "",
    day: [] as number[],
    tier: "1",
    item_id: "TICKET_" + new Date().getTime(),
  });

  const [price, setPrice] = useState(0);

  const [userStatus, setUserStatus] = useState<{
    found: boolean;
    name?: string;
  } | null>(null);

  // Calculate Price Effect
  useEffect(() => {
    let calculatedPrice = 0;
    // 150/day + 150 caution
    if (formData.day.length > 0) {
      calculatedPrice = formData.day.length * 150 + 150;
    }
    setPrice(calculatedPrice);
  }, [formData.day]);

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
        password: formData.password, // Pass password
        gender: formData.gender,
        is_nitpy: formData.is_nitpy,
        college_name: formData.college_name,

        type: "ACCOMM",
        quantity: 1,
        hostel: formData.hostel,
        day: formData.day,
        item_id: formData.item_id,
        // Ignored fields for ACCOMM
        size: undefined,
        event_id: undefined,
        tier: undefined,
      });

      if (res.success && res.data) {
        success(
          `Payment Initiated. OrderID: ${res.data.orderId}`,
          "Processing Payment",
        );

        // Load Cashfree SDK
        const cashfree = await load({
          mode:
            process.env.NEXT_PUBLIC_PAYMENT_ENV === "PRODUCTION"
              ? "production"
              : "sandbox",
        });

        await cashfree.checkout({
          paymentSessionId: res.data.paymentSessionId,
          returnUrl: window.location.href, // This might need handling if redirecting back
          redirectTarget: "_modal",
        });

        // Reset sensitive fields
        setFormData((prev) => ({
          ...prev,
          email: "",
          name: "",
          phone: "",
          password: "",
          gender: "male",
          is_nitpy: false,
          college_name: "",
          hostel: "",
          day: [],
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
          <span className="text-white">Accommodation Registration</span>
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
                  {/* NEW PASSWORD FIELD */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="text"
                      required
                      placeholder="Set User Password"
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
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

          {/* Accommodation Fields */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hostel</Label>
                <Select
                  value={formData.hostel}
                  onValueChange={(val) => handleChange("hostel", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Hostel" />
                  </SelectTrigger>
                  <SelectContent className={darkDropdownClass}>
                    <SelectItem value="BHARANI">BHARANI</SelectItem>
                    <SelectItem value="BHAVANI">BHAVANI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Days</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      {formData.day.length > 0
                        ? `Days: ${formData.day.join(", ")}`
                        : "Select Days"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className={darkDropdownClass}>
                    {[1, 2, 3].map((day) => (
                      <DropdownMenuCheckboxItem
                        key={day}
                        checked={formData.day.includes(day)}
                        onCheckedChange={(checked) => {
                          setFormData((prev) => {
                            const currentDays = prev.day;
                            if (checked) {
                              return {
                                ...prev,
                                day: [...currentDays, day].sort(),
                              };
                            } else {
                              return {
                                ...prev,
                                day: currentDays.filter((d) => d !== day),
                              };
                            }
                          });
                        }}
                      >
                        Day {day}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="col-span-2 text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                Base: ₹{formData.day.length * 150} ({formData.day.length} days)
                + Caution: ₹150. Total: ₹{formData.day.length * 150 + 150}
              </div>
            </div>
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
