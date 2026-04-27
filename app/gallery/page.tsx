"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Ably from "ably";
import { ArrowLeft, Camera, X, Star, ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { parseApiResponse } from "@/lib/client-api";

interface GalleryPhoto {
  id: string;
  imageUrl: string;
  guestName?: string | null;
  isFeatured: boolean;
  createdAt: string;
}

export default function GalleryPage() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let realtime: Ably.Realtime | null = null;
    let channel: {
      subscribe: (listener: () => void) => void;
      unsubscribe: () => void;
    } | null = null;

    const loadGallery = async () => {
      try {
        const response = await fetch("/api/gallery");
        const data = await parseApiResponse<{ photos: GalleryPhoto[]; error?: string }>(response);

        if (!response.ok) {
          throw new Error(data.error || "Unable to load the gallery.");
        }

        if (active) {
          setPhotos(data.photos);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to load the gallery.";
        toast.error(message);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    const connectRealtime = async () => {
      try {
        realtime = new Ably.Realtime({
          authUrl: `/api/realtime/token?clientId=gallery-${crypto.randomUUID()}`,
        });

        channel = realtime.channels.get("gallery-updates");
        channel.subscribe(() => {
          void loadGallery();
        });
      } catch {
        toast.error("Real-time gallery updates are unavailable right now.");
      }
    };

    void loadGallery();
    void connectRealtime();

    return () => {
      active = false;
      try {
        channel?.unsubscribe();
      } catch {
        // Ignore teardown errors during route transitions and Fast Refresh.
      }
    };
  }, []);

  const openLightbox = (photo: GalleryPhoto, index: number) => {
    setSelectedPhoto(photo);
    setSelectedIndex(index);
  };

  const closeLightbox = () => {
    setSelectedPhoto(null);
  };

  const goToPrevious = () => {
    const newIndex = selectedIndex === 0 ? photos.length - 1 : selectedIndex - 1;
    setSelectedIndex(newIndex);
    setSelectedPhoto(photos[newIndex]);
  };

  const goToNext = () => {
    const newIndex = selectedIndex === photos.length - 1 ? 0 : selectedIndex + 1;
    setSelectedIndex(newIndex);
    setSelectedPhoto(photos[newIndex]);
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-sans text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <h1 className="font-serif text-lg text-foreground">Wedding Gallery</h1>
          <Link href="/upload">
            <Button size="sm" className="rounded-full bg-primary font-sans text-sm text-primary-foreground">
              <Camera className="mr-1.5 h-4 w-4" />
              Upload
            </Button>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10 text-center">
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-serif text-3xl text-foreground sm:text-4xl">
          Our Wedding Memories
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-3 font-sans text-muted-foreground"
        >
          {isLoading ? "Loading approved photos..." : `${photos.length} approved moments shared by your guests`}
        </motion.p>
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-16">
        {isLoading ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
            Loading gallery...
          </div>
        ) : photos.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <p className="font-sans text-muted-foreground">No approved images are live yet. Check back soon.</p>
          </div>
        ) : (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
            {photos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="mb-4 break-inside-avoid"
              >
                <div onClick={() => openLightbox(photo, index)} className="group relative cursor-pointer overflow-hidden rounded-xl bg-muted">
                  <img src={photo.imageUrl} alt={`Photo by ${photo.guestName || "guest"}`} className="w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="font-sans text-sm text-white/90">{photo.guestName ? `By ${photo.guestName}` : "Shared anonymously"}</p>
                      {photo.isFeatured && (
                        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1 text-xs text-white">
                          <Star className="h-3.5 w-3.5" fill="currentColor" />
                          Featured
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
            onClick={closeLightbox}
          >
            <button onClick={closeLightbox} className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20">
              <X className="h-6 w-6" />
            </button>

            {photos.length > 1 && (
              <>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    goToPrevious();
                  }}
                  className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    goToNext();
                  }}
                  className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            <motion.div
              key={selectedPhoto.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative max-h-[85vh] max-w-[90vw]"
              onClick={(event) => event.stopPropagation()}
            >
              <img src={selectedPhoto.imageUrl} alt={`Photo by ${selectedPhoto.guestName || "guest"}`} className="max-h-[85vh] w-auto rounded-lg object-contain" />

              <div className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-gradient-to-t from-black/80 to-transparent p-6">
                <p className="font-sans text-lg text-white">{selectedPhoto.guestName ? `By ${selectedPhoto.guestName}` : "Shared anonymously"}</p>
                <p className="mt-2 font-sans text-sm text-white/75">
                  {selectedPhoto.isFeatured ? "Featured by the event team" : "Approved by the event team"}
                </p>
              </div>
            </motion.div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <p className="font-sans text-sm text-white/60">
                {selectedIndex + 1} / {photos.length}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
