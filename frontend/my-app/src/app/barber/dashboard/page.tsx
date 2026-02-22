"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function BarberDashboard() {
  const router = useRouter();
  const [services, setServices] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [showAppointments, setShowAppointments] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  const handleCreateService = async () => {
    const token = localStorage.getItem("token");
    const tenantId = localStorage.getItem("tenant");

    if (!tenantId || !token) {
      toast.error("Session expired. Please login again.");
      router.push("/");
      return;
    }

    if (!name || !price) {
      toast.warning("Please fill all fields");
      return;
    }

    const loadingToast = toast.loading("Creating service...");
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/services/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "x-tenant-id": tenantId,
          },
          body: JSON.stringify({ name, price }),
        },
      );

      const data = await res.json();

      toast.dismiss(loadingToast);
      setLoading(false);

      if (res.ok) {
        toast.success("Service created successfully ✂️");

        setOpen(false);
        setName("");
        setPrice("");

        await fetchServices();
      } else {
        toast.error(data.message || "Failed to create service");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      setLoading(false);
      toast.error("Network error. Please try again.");
    }
  };

  const fetchServices = async () => {
    const token = localStorage.getItem("token");
    const tenantId = localStorage.getItem("tenant");

    if (!token || !tenantId) return;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/services`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-tenant-id": tenantId,
      },
    });

    const data = await res.json();
    setServices(data);
  };

  const fetchAppointments = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/appointments/all`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await res.json();
    setAppointments(data);
  };

  useEffect(() => {
    fetchServices();
    fetchAppointments();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/");
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 🔥 Responsive Navbar */}
      <div className="bg-white shadow-sm border-b px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-800">
          Barber Dashboard
        </h1>

        <Button
          variant="destructive"
          onClick={handleLogout}
          className="w-full sm:w-auto"
        >
          Logout
        </Button>
      </div>

      {/* 🔥 Quick Actions */}
      <div className="px-4 sm:px-6 lg:px-8 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
          </CardHeader>

          <Separator />

          <CardContent className="flex flex-col sm:flex-row gap-4 pt-4">
            {/* Create Service Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">Create Service</Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Service</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                  <input
                    type="text"
                    placeholder="Service Name"
                    className="w-full border rounded-lg px-3 py-2"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />

                  <input
                    type="number"
                    placeholder="Price"
                    className="w-full border rounded-lg px-3 py-2"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                  />

                  <Button
                    onClick={handleCreateService}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? "Creating..." : "Add Service"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => {
                setShowAppointments((prev) => !prev);
                fetchAppointments();
              }}
            >
              {showAppointments ? "Hide Appointments" : "View Appointments"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 🔥 All Services */}
      <div className="px-4 sm:px-6 lg:px-8">
        <Card className="mt-6 p-4 space-y-4">
          <h1 className="text-lg sm:text-xl font-semibold">All Services</h1>

          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white border border-muted-foreground/30 shadow-sm p-4 rounded-lg flex flex-col sm:flex-row sm:justify-between gap-2"
            >
              <span className="font-medium">{service.name}</span>
              <span>₹ {service.price}</span>
            </div>
          ))}
        </Card>
      </div>

      {/* 🔥 Appointments Section */}
      {showAppointments && (
        <div className="px-4 sm:px-6 lg:px-8 pb-10 mt-8">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">
                Customer Appointments
              </CardTitle>
            </CardHeader>

            <Separator />

            <CardContent className="space-y-4">
              {appointments.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                  No appointments yet.
                </div>
              ) : (
                appointments.map((booking: any) => (
                  <div
                    key={booking.id}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white p-4 sm:p-5 rounded-xl shadow-sm border"
                  >
                    <div>
                      <p className="font-semibold text-gray-800 text-base sm:text-lg">
                        {booking.service_name}
                      </p>

                      <p className="text-sm text-gray-500">
                        Customer: {booking.customer_name}
                      </p>

                      <p className="text-sm text-gray-500">
                        {new Date(booking.appointment_time).toLocaleString()}
                      </p>
                    </div>

                    <span
                      className={`px-4 py-1.5 text-sm font-medium rounded-full self-start sm:self-auto ${
                        booking.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : booking.status === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
