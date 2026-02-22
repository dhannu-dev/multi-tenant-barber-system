"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AdminLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const loadingToast = toast.loading("Authenticating admin...");
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        },
      );

      const data = await res.json();

      toast.dismiss(loadingToast);
      setLoading(false);

      if (res.ok && data.token) {
        localStorage.setItem("adminToken", data.token);

        toast.success("Admin login successful 🔐");

        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 800);
      } else {
        toast.error(data.message || "Invalid admin credentials");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      setLoading(false);
      toast.error("Network error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-100">
      {/* 🔥 Left Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-gray-900 to-black items-center justify-center p-12">
        <div className="text-white space-y-4 text-center">
          <h1 className="text-4xl xl:text-5xl font-bold tracking-wide">
            BarberPro Admin
          </h1>
          <p className="text-lg opacity-80">Global Tenant Management System</p>
          <p className="text-sm opacity-70 max-w-md">
            Manage barber shops, schemas and system access.
          </p>
        </div>
      </div>

      {/* 🔥 Right Login Card */}
      <div className="flex flex-1 items-center justify-center px-4 sm:px-6 py-10">
        <div className="w-full max-w-md bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-6 sm:p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Super Admin Login
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Secure access to admin panel
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Admin Email
              </label>
              <input
                type="email"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-gray-900 focus:outline-none"
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-gray-900 focus:outline-none"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-black text-white font-semibold text-sm sm:text-base hover:bg-gray-800 transition disabled:opacity-70"
            >
              {loading ? "Logging in..." : "Login to Admin Panel"}
            </button>
          </form>

          <div className="text-center text-xs text-gray-400">
            Authorized access only
          </div>
        </div>
      </div>
    </div>
  );
}
