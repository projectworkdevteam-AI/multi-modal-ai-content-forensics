"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Clock, Loader2, XCircle, AlertTriangle } from "lucide-react";
import { api } from "@/lib/apiClient";

interface JobStatusCardProps {
  jobId: string;
}

interface JobData {
  id: string;
  status: "queued" | "processing" | "completed" | "failed" | "cancelled";
  modality: string;
  file_name: string;
  created_at: string;
  error_message?: string;
}

export const JobStatusCard: React.FC<JobStatusCardProps> = ({ jobId }) => {
  const [job, setJob] = useState<JobData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const fetchStatus = async () => {
      try {
        const data = await api.get(`/jobs/${jobId}`);
        setJob(data);

        // Continue polling if not in a terminal state
        if (data.status === "queued" || data.status === "processing") {
          timeoutId = setTimeout(fetchStatus, 3000); // poll every 3 seconds
        }
      } catch (err: any) {
        setError(err.data?.detail || "Failed to fetch job status.");
        timeoutId = setTimeout(fetchStatus, 5000); // retry after 5s on error
      }
    };

    fetchStatus();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [jobId]);

  if (error && !job) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 flex items-center space-x-3">
        <AlertTriangle className="h-5 w-5" />
        <span>{error}</span>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-6 border rounded-xl flex items-center justify-center space-x-3 text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Fetching job details...</span>
      </div>
    );
  }

  const renderStatusIcon = () => {
    switch (job.status) {
      case "queued":
        return <Clock className="h-6 w-6 text-gray-400" />;
      case "processing":
        return <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />;
      case "completed":
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case "failed":
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Clock className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (job.status) {
      case "queued":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border dark:border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {renderStatusIcon()}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {job.file_name || "Unknown File"}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Job ID: <span className="font-mono text-xs">{job.id}</span>
            </p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${getStatusColor()}`}
        >
          {job.status}
        </span>
      </div>

      {job.error_message && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-600 dark:text-red-400 flex items-start space-x-2">
          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>{job.error_message}</p>
        </div>
      )}

      {job.status === "completed" && (
        <div className="mt-6">
          {/* We will add Report viewing capabilities in the future */}
          <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            View Forensic Report
          </button>
        </div>
      )}
    </div>
  );
};
