"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [tenant, setTenant] = useState("");
  const [tenants, setTenants] = useState<
    { name: string; schema_name: string }[]
  >([]);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tenant) {
      toast.warning("Please select a barber shop");
      return;
    }

    const loadingToast = toast.loading("Logging in...");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tenants/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-tenant-id": tenant,
          },
          body: JSON.stringify(form),
        },
      );

      const data = await res.json();
      toast.dismiss(loadingToast);

      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("tenant", tenant);
        localStorage.setItem("role", data.role);

        toast.success("Login successful 🎉");

        if (data.role === "customer") {
          router.push("/customer/dashboard");
        } else if (data.role === "barber") {
          router.push("/barber/dashboard");
        }
      } else {
        toast.error(data.message || "Invalid credentials");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Network error. Please try again.");
    }
  };

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/tenants`,
        );
        const data = await res.json();
        setTenants(data);
        if (data.length > 0) {
          setTenant(data[0].schema_name);
        }
      } catch (error) {
        console.error("Failed to load tenants");
      }
    };

    fetchTenants();
  }, []);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-100">
      {/* 🔥 Left Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-purple-600 to-indigo-600 items-center justify-center p-12">
        <div className="text-white space-y-4 text-center">
          <h1 className="text-4xl xl:text-5xl font-bold">BarberPro</h1>
          <p className="text-lg opacity-90">
            Multi-Tenant Barber Appointment Management System
          </p>
          <p className="text-sm opacity-80 max-w-md">
            Manage services, appointments and customers seamlessly.
          </p>
        </div>
      </div>

      {/* 🔥 Right Login Section */}
      <div className="flex flex-1 items-center justify-center px-4 sm:px-6 py-10">
        <div className="w-full max-w-md bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-6 sm:p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Welcome Back
            </h2>
            <p className="text-gray-500 text-sm mt-1">Login to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Select Tenant */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Select Barber Shop
              </label>

              <Select value={tenant} onValueChange={setTenant}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a barber shop" />
                </SelectTrigger>

                <SelectContent>
                  {tenants.length > 0
                    ? tenants.map((t) => (
                        <SelectItem key={t.schema_name} value={t.schema_name}>
                          {t.name}
                        </SelectItem>
                      ))
                    : "No Shop Registered"}
                </SelectContent>
              </Select>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-purple-500 focus:outline-none"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-purple-500 focus:outline-none"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-linear-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm sm:text-base hover:opacity-90 transition"
            >
              Login
            </button>
          </form>

          {/* Signup Link */}
          <p className="text-sm text-center text-gray-500">
            Don’t have an account?{" "}
            <Link
              href="/signup"
              className="text-purple-600 font-semibold hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
