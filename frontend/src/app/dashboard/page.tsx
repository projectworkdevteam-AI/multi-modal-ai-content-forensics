"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/apiClient";
import Cookies from "js-cookie";

import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { JobStatusCard } from "@/components/upload/JobStatusCard";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [jobIds, setJobIds] = useState<string[]>([]);

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

  const handleUploadSuccess = (jobId: string) => {
    setJobIds((prev) => [jobId, ...prev]);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <nav className="bg-white dark:bg-gray-900 shadow">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-800 dark:text-white">Forensics Dashboard</span>
            </div>
            <div className="flex items-center">
              <span className="mr-4 text-gray-600 dark:text-gray-300">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-8">
          <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border dark:border-gray-800">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Analyze New Media</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Upload an image to scan for manipulation, generative AI artifacts, or deepfakes.
            </p>
            <div className="mt-6">
              <UploadDropzone onUploadSuccess={handleUploadSuccess} />
            </div>
          </div>

          {jobIds.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-medium text-gray-800 dark:text-gray-200">Recent Scans</h2>
              <div className="grid gap-4">
                {jobIds.map((id) => (
                  <JobStatusCard key={id} jobId={id} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
