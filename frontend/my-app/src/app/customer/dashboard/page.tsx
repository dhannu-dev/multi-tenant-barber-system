"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Dashboard() {
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [appointmentTime, setAppointmentTime] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/services`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!res.ok) {
          throw new Error("Failed to fetch services");
        }

        const data = await res.json();
        setServices(data);
      } catch (error) {
        console.error(error);
        alert("Could not load services");
      }
    };

    fetchServices();
  }, []);

  const handleBookClick = (service: any) => {
    setSelectedService(service);
    setOpen(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/appointments/my`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error("Failed to fetch appointments");
      }

      const data = await res.json();
      setAppointments(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/");
    }
  }, []);

  const confirmBooking = async () => {
    const token = localStorage.getItem("token");

    if (!appointmentTime) {
      toast.warning("Please select date & time");
      return;
    }

    const loadingToast = toast.loading("Booking appointment...");
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/appointments/book`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            serviceId: selectedService.id,
            appointmentTime,
          }),
        },
      );

      const data = await res.json();

      toast.dismiss(loadingToast);
      setLoading(false);

      if (res.ok) {
        toast.success("Appointment booked successfully 🎉");
        setOpen(false);
        setAppointmentTime("");
        fetchAppointments();
      } else {
        toast.error(data.message || "Booking failed");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      setLoading(false);
      toast.error("Network error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 🔥 Responsive Navbar */}
      <div className="bg-white shadow-sm border-b px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-800">
          Customer Dashboard
        </h1>

        <Button
          variant="destructive"
          onClick={handleLogout}
          className="w-full sm:w-auto"
        >
          Logout
        </Button>
      </div>

      {/* 🔥 Available Services */}
      <div className="px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              Available Services
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {services?.map((service: any) => (
              <div
                key={service.id}
                className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-gray-50 p-4 rounded-lg border"
              >
                <div>
                  <p className="font-medium text-gray-800">{service.name}</p>
                  <p className="text-sm text-gray-500">₹ {service.price}</p>
                </div>

                <Button
                  onClick={() => handleBookClick(service)}
                  className="w-full sm:w-auto"
                >
                  Book
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 🔥 Booking History */}
      <div className="px-4 sm:px-6 lg:px-8 pb-10">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              Booking History
            </CardTitle>
          </CardHeader>

          <Separator />

          <CardContent className="space-y-4">
            {appointments.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No bookings yet.
              </div>
            ) : (
              appointments.map((booking: any) => (
                <div
                  key={booking.id}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white shadow-sm p-4 sm:p-5 rounded-xl border hover:shadow-md transition"
                >
                  {/* Left Section */}
                  <div>
                    <p className="font-semibold text-gray-800 text-base sm:text-lg">
                      {booking.service_name}
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(booking.appointment_time).toLocaleString()}
                    </p>
                  </div>

                  {/* Status Badge */}
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

      {/* 🔥 Booking Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              Book {selectedService?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <input
              type="datetime-local"
              className="w-full border rounded-lg px-3 py-2"
              value={appointmentTime}
              onChange={(e) => setAppointmentTime(e.target.value)}
            />

            <Button
              onClick={confirmBooking}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Booking..." : "Confirm Booking"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
