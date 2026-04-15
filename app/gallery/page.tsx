"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Camera, X, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock gallery data
const mockPhotos = [
  { id: "1", url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80", uploaderName: "Emma", likes: 12, aspectRatio: "portrait" },
  { id: "2", url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80", uploaderName: "Michael", likes: 8, aspectRatio: "landscape" },
  { id: "3", url: "https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=800&q=80", uploaderName: "Sophie", likes: 15, aspectRatio: "portrait" },
  { id: "4", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80", uploaderName: "David", likes: 6, aspectRatio: "landscape" },
  { id: "5", url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80", uploaderName: "Lisa", likes: 20, aspectRatio: "portrait" },
  { id: "6", url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80", uploaderName: "James", likes: 9, aspectRatio: "landscape" },
  { id: "7", url: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&q=80", uploaderName: "Anna", likes: 11, aspectRatio: "portrait" },
  { id: "8", url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80", uploaderName: "Tom", likes: 7, aspectRatio: "landscape" },
  { id: "9", url: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&q=80", uploaderName: "Sarah", likes: 14, aspectRatio: "portrait" },
  { id: "10", url: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&q=80", uploaderName: "Chris", likes: 5, aspectRatio: "landscape" },
  { id: "11", url: "https://images.unsplash.com/photo-1544078751-58fee2d8a03b?w=800&q=80", uploaderName: "Rachel", likes: 18, aspectRatio: "portrait" },
  { id: "12", url: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=800&q=80", uploaderName: "Alex", likes: 10, aspectRatio: "landscape" },
];

interface Photo {
  id: string;
  url: string;
  uploaderName: string;
  likes: number;
  aspectRatio: string;
}

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>(mockPhotos);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const openLightbox = (photo: Photo, index: number) => {
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

  const toggleLike = (photoId: string) => {
    setPhotos((prev) =>
      prev.map((p) =>
        p.id === photoId ? { ...p, likes: p.likes + 1 } : p
      )
    );
    if (selectedPhoto && selectedPhoto.id === photoId) {
      setSelectedPhoto((prev) =>
        prev ? { ...prev, likes: prev.likes + 1 } : null
      );
    }
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
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
            <Button
              size="sm"
              className="rounded-full bg-primary font-sans text-sm text-primary-foreground"
            >
              <Camera className="mr-1.5 h-4 w-4" />
              Upload
            </Button>
          </Link>
        </div>
      </header>

      {/* Gallery Header */}
      <div className="mx-auto max-w-7xl px-6 py-10 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-3xl text-foreground sm:text-4xl"
        >
          Our Wedding Memories
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-3 font-sans text-muted-foreground"
        >
          {photos.length} beautiful moments captured by our guests
        </motion.p>
      </div>

      {/* Masonry Gallery Grid */}
      <div className="mx-auto max-w-7xl px-6 pb-16">
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
          {photos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="mb-4 break-inside-avoid"
            >
              <div
                onClick={() => openLightbox(photo, index)}
                className="group relative cursor-pointer overflow-hidden rounded-xl bg-muted"
              >
                <Image
                  src={photo.url}
                  alt={`Photo by ${photo.uploaderName}`}
                  width={400}
                  height={photo.aspectRatio === "portrait" ? 600 : 300}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="font-sans text-sm text-white/90">
                      By {photo.uploaderName}
                    </p>
                    <div className="mt-1 flex items-center gap-1 text-white/70">
                      <Heart className="h-4 w-4" fill="currentColor" />
                      <span className="font-sans text-sm">{photo.likes}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
            onClick={closeLightbox}
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Previous button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Next button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Image */}
            <motion.div
              key={selectedPhoto.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative max-h-[85vh] max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedPhoto.url}
                alt={`Photo by ${selectedPhoto.uploaderName}`}
                width={1200}
                height={800}
                className="max-h-[85vh] w-auto rounded-lg object-contain"
              />
              
              {/* Photo info */}
              <div className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-gradient-to-t from-black/80 to-transparent p-6">
                <p className="font-sans text-lg text-white">
                  By {selectedPhoto.uploaderName}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(selectedPhoto.id);
                  }}
                  className="mt-2 flex items-center gap-2 text-white/80 transition-colors hover:text-primary"
                >
                  <Heart className="h-5 w-5" fill="currentColor" />
                  <span className="font-sans">{selectedPhoto.likes} likes</span>
                </button>
              </div>
            </motion.div>

            {/* Photo counter */}
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
