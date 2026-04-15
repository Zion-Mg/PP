"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import Link from "next/link";
import Image from "next/image";
import { 
  Upload, 
  X, 
  Check, 
  ImagePlus, 
  ArrowLeft,
  Heart,
  Images
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
}

export default function UploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploaderName, setUploaderName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const remainingSlots = 5 - files.length;
    const filesToAdd = acceptedFiles.slice(0, remainingSlots);
    
    const newFiles: UploadedFile[] = filesToAdd.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  }, [files.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: 5 - files.length,
    disabled: files.length >= 5,
  });

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleSubmit = async () => {
    if (files.length === 0) return;
    
    setIsUploading(true);

    // Simulate upload progress for each file
    for (let i = 0; i < files.length; i++) {
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, progress } : f
          )
        );
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsUploading(false);
    setIsComplete(true);
  };

  // Success Screen
  if (isComplete) {
    return (
      <main className="min-h-screen bg-background">
        <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <Check className="h-12 w-12 text-primary" />
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-balance text-center font-serif text-3xl text-foreground sm:text-4xl"
          >
            Thank you for sharing this memory
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4"
          >
            <Heart className="h-8 w-8 text-primary" fill="currentColor" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-6 text-center font-sans text-muted-foreground"
          >
            {files.length} {files.length === 1 ? "photo" : "photos"} uploaded successfully
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-10 flex flex-col gap-4 sm:flex-row"
          >
            <Link href="/gallery">
              <Button
                size="lg"
                className="min-w-[180px] rounded-full bg-primary px-8 font-sans text-primary-foreground"
              >
                <Images className="mr-2 h-5 w-5" />
                View Gallery
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                setFiles([]);
                setIsComplete(false);
                setUploaderName("");
              }}
              className="min-w-[180px] rounded-full border-border px-8 font-sans"
            >
              Upload More
            </Button>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-sans text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <h1 className="font-serif text-lg text-foreground">Upload Photos</h1>
          <div className="w-16" />
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="font-serif text-3xl text-foreground sm:text-4xl">
            Share Your Moments
          </h2>
          <p className="mt-3 font-sans text-muted-foreground">
            Upload up to 5 photos from the wedding
          </p>
        </motion.div>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-10"
        >
          <div
            {...getRootProps()}
            className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 ${
              isDragActive
                ? "border-primary bg-primary/5"
                : files.length >= 5
                ? "border-border bg-muted/30 cursor-not-allowed"
                : "border-border hover:border-primary/50 hover:bg-muted/30"
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <div className={`rounded-full p-4 ${
                isDragActive ? "bg-primary/10" : "bg-muted"
              }`}>
                <ImagePlus className={`h-8 w-8 ${
                  isDragActive ? "text-primary" : "text-muted-foreground"
                }`} />
              </div>
              {files.length >= 5 ? (
                <p className="font-sans text-muted-foreground">
                  Maximum 5 photos reached
                </p>
              ) : (
                <>
                  <p className="font-sans text-foreground">
                    {isDragActive
                      ? "Drop your photos here"
                      : "Drag & drop photos here"}
                  </p>
                  <p className="font-sans text-sm text-muted-foreground">
                    or click to browse
                  </p>
                </>
              )}
            </div>
          </div>

          {/* File Counter */}
          <p className="mt-3 text-center font-sans text-sm text-muted-foreground">
            {files.length}/5 photos selected
          </p>
        </motion.div>

        {/* Preview Grid */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8"
            >
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {files.map((file, index) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative aspect-square overflow-hidden rounded-xl bg-muted"
                  >
                    <Image
                      src={file.preview}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    
                    {/* Progress overlay during upload */}
                    {isUploading && file.progress < 100 && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                        <Upload className="mb-2 h-6 w-6 animate-pulse text-white" />
                        <Progress 
                          value={file.progress} 
                          className="h-1 w-3/4"
                        />
                      </div>
                    )}

                    {/* Success overlay */}
                    {isUploading && file.progress === 100 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <div className="rounded-full bg-primary p-2">
                          <Check className="h-5 w-5 text-primary-foreground" />
                        </div>
                      </div>
                    )}

                    {/* Remove button */}
                    {!isUploading && (
                      <button
                        onClick={() => removeFile(file.id)}
                        className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Name Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <label className="block font-sans text-sm font-medium text-foreground">
            Your Name (optional)
          </label>
          <Input
            type="text"
            placeholder="Enter your name"
            value={uploaderName}
            onChange={(e) => setUploaderName(e.target.value)}
            className="mt-2 rounded-xl border-border bg-card font-sans"
          />
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10"
        >
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={files.length === 0 || isUploading}
            className="w-full rounded-full bg-primary py-6 font-sans text-base font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
          >
            {isUploading ? (
              <span className="flex items-center gap-2">
                <Upload className="h-5 w-5 animate-pulse" />
                Uploading...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload {files.length} {files.length === 1 ? "Photo" : "Photos"}
              </span>
            )}
          </Button>
        </motion.div>
      </div>
    </main>
  );
}
