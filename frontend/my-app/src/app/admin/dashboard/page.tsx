"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function AdminDashboard() {
  const router = useRouter();
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    schema_name: "",
  });

  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("adminToken");

    if (!form.name || !form.schema_name) {
      toast.warning("Please fill all fields");
      return;
    }

    const loadingToast = toast.loading("Creating salon...");
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tenants`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        },
      );

      const data = await res.json();

      toast.dismiss(loadingToast);
      setLoading(false);

      if (res.ok) {
        toast.success("Salon created successfully 🎉");

        setForm({ name: "", schema_name: "" });
        setOpen(false);
        fetchTenants();
      } else {
        toast.error(data.message || "Failed to create salon");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      setLoading(false);
      toast.error("Network error. Please try again.");
    }
  };

  const fetchTenants = async () => {
    const token = localStorage.getItem("adminToken");

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tenants`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    console.log("data", data);
    setTenants(data);
  };

  const handleToggle = async (id: number) => {
    const token = localStorage.getItem("adminToken");

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tenants/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchTenants(); // refresh list
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");

    if (!adminToken) {
      router.push("/admin");
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 🔥 Responsive Navbar */}
      <div className="bg-white shadow-sm border-b px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-800">
          Super Admin Dashboard
        </h1>

        <Button
          variant="destructive"
          onClick={handleLogout}
          className="w-full sm:w-auto"
        >
          Logout
        </Button>
      </div>

      {/* 🔥 Tenant Management */}
      <div className="px-4 sm:px-6 lg:px-8 pb-8 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              Tenant Management
            </CardTitle>
          </CardHeader>

          <Separator />

          <CardContent className="flex flex-col sm:flex-row gap-4 pt-4">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">Create New Salon</Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Salon</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleCreateTenant} className="space-y-4 mt-4">
                  <input
                    type="text"
                    placeholder="Salon Name"
                    className="w-full border rounded-lg px-3 py-2"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />

                  <input
                    type="text"
                    placeholder="Schema Name (lowercase_with_underscore)"
                    className="w-full border rounded-lg px-3 py-2"
                    value={form.schema_name}
                    onChange={(e) =>
                      setForm({ ...form, schema_name: e.target.value })
                    }
                  />

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating..." : "Create Tenant"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* 🔥 All Salons */}
      <div className="px-4 sm:px-6 lg:px-8 pb-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">All Salons</CardTitle>
          </CardHeader>

          <Separator />

          <CardContent className="space-y-4 pt-4">
            {tenants.map((tenant) => (
              <div
                key={tenant.id}
                className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-gray-50 p-4 rounded-lg border"
              >
                <div>
                  <p className="font-medium text-gray-800">{tenant.name}</p>
                  <p className="text-sm text-gray-500">
                    Schema: {tenant.schema_name}
                  </p>
                </div>

                <Button
                  variant={tenant.is_active ? "destructive" : "default"}
                  className="w-full sm:w-auto"
                  onClick={() => handleToggle(tenant.id)}
                >
                  {tenant.is_active ? "Disable" : "Activate"}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
