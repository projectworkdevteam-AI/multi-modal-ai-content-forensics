"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/apiClient";
import Cookies from "js-cookie";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await api.get("/auth/me");
        setUser(data.user);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        // Middleware should have caught this, but just in case:
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      const refreshToken = Cookies.get("refresh_token");
      if (refreshToken) {
        await api.post("/auth/logout", { refresh_token: refreshToken });
      }
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      Cookies.remove("access_token", { path: "/" });
      Cookies.remove("refresh_token", { path: "/" });
      router.push("/login");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-800">Forensics Dashboard</span>
            </div>
            <div className="flex items-center">
              <span className="mr-4 text-gray-600">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="p-6 bg-white rounded shadow">
            <h1 className="text-2xl font-semibold text-gray-900">Welcome to your dashboard!</h1>
            <p className="mt-4 text-gray-600">
              You have successfully authenticated. Your JWT is valid and stored securely.
            </p>
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900">User Details (from /auth/me)</h3>
              <pre className="p-4 mt-2 overflow-x-auto text-sm text-gray-800 bg-gray-100 rounded">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
