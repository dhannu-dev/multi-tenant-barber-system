"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function SignupPage() {
  const [tenant, setTenant] = useState("shaloon_A");
  const [tenants, setTenants] = useState<
    { name: string; schema_name: string }[]
  >([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tenant) {
      toast.warning("Please select a barber shop");
      return;
    }

    const loadingToast = toast.loading("Creating account...");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tenants/signup`,
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

      if (res.ok) {
        toast.success("Account created successfully 🎉");

        setTimeout(() => {
          router.push("/");
        }, 1200);
      } else {
        toast.error(data.message || "Signup failed");
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
            Create your account and start managing appointments.
          </p>
        </div>
      </div>

      {/* 🔥 Right Signup Section */}
      <div className="flex flex-1 items-center justify-center px-4 sm:px-6 py-10">
        <div className="w-full max-w-md bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-6 sm:p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Create Account
            </h2>
            <p className="text-gray-500 text-sm mt-1">Join your barber shop</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Tenant Select */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Select Barber Shop
              </label>

              <Select value={tenant} onValueChange={setTenant}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a barber shop" />
                </SelectTrigger>

                <SelectContent>
                  {tenants.map((t) => (
                    <SelectItem key={t.schema_name} value={t.schema_name}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-purple-500 focus:outline-none"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
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

            {/* Role Select */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Select Role
              </label>

              <Select
                value={form.role}
                onValueChange={(value) => setForm({ ...form, role: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="barber">Barber</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-linear-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm sm:text-base hover:opacity-90 transition"
            >
              Create Account
            </button>
          </form>

          {/* Login Link */}
          <p className="text-sm text-center text-gray-500">
            Already have an account?{" "}
            <Link
              href="/"
              className="text-purple-600 font-semibold hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
