"use client";

import React, { useCallback, useState } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { UploadCloud, File, AlertCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/apiClient";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

interface UploadDropzoneProps {
  onUploadSuccess: (jobId: string) => void;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      setError(null);

      if (fileRejections.length > 0) {
        const rejection = fileRejections[0];
        if (rejection.errors[0].code === "file-too-large") {
          setError("File exceeds the maximum limit of 20 MB.");
        } else if (rejection.errors[0].code === "file-invalid-type") {
          setError("Invalid file type. Only JPEG, PNG, and WebP are allowed.");
        } else {
          setError(rejection.errors[0].message);
        }
        return;
      }

      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await api.post("/detect/image", formData);
        onUploadSuccess(response.job_id);
      } catch (err: any) {
        setError(err.data?.detail || err.message || "Failed to upload file.");
      } finally {
        setUploading(false);
      }
    },
    [onUploadSuccess]
  );

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    disabled: uploading,
  });

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
          isDragActive
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600"
        } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4">
          {uploading ? (
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
          ) : (
            <UploadCloud className="h-12 w-12 text-gray-400" />
          )}
          
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isDragActive ? (
              <p>Drop the file here...</p>
            ) : (
              <p>
                Drag & drop an image here, or <span className="text-blue-500">click to select</span>
              </p>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            JPEG, PNG, WEBP (Max 20MB)
          </p>
        </div>
      </div>

      {acceptedFiles.length > 0 && !error && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center space-x-4">
          <File className="h-6 w-6 text-gray-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
              {acceptedFiles[0].name}
            </p>
            <p className="text-xs text-gray-500">
              {(acceptedFiles[0].size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center space-x-3 text-red-600 dark:text-red-400">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};
