"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Download,
  Trash2,
  Star,
  Check,
  X,
  Search,
  Filter,
  Grid3X3,
  List,
  MoreHorizontal,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Mock admin data
const mockAdminPhotos = [
  { id: "1", url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80", uploaderName: "Emma Thompson", uploadedAt: "2024-06-15 14:32", approved: true, featured: true },
  { id: "2", url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&q=80", uploaderName: "Michael Chen", uploadedAt: "2024-06-15 14:45", approved: true, featured: false },
  { id: "3", url: "https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=400&q=80", uploaderName: "Sophie Williams", uploadedAt: "2024-06-15 15:01", approved: false, featured: false },
  { id: "4", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80", uploaderName: "David Brown", uploadedAt: "2024-06-15 15:18", approved: true, featured: false },
  { id: "5", url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400&q=80", uploaderName: "Lisa Anderson", uploadedAt: "2024-06-15 15:32", approved: true, featured: true },
  { id: "6", url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400&q=80", uploaderName: "James Wilson", uploadedAt: "2024-06-15 15:47", approved: false, featured: false },
  { id: "7", url: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=400&q=80", uploaderName: "Anna Martinez", uploadedAt: "2024-06-15 16:02", approved: true, featured: false },
  { id: "8", url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&q=80", uploaderName: "Tom Garcia", uploadedAt: "2024-06-15 16:15", approved: true, featured: false },
];

interface AdminPhoto {
  id: string;
  url: string;
  uploaderName: string;
  uploadedAt: string;
  approved: boolean;
  featured: boolean;
}

export default function AdminPage() {
  const [photos, setPhotos] = useState<AdminPhoto[]>(mockAdminPhotos);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "approved" | "pending">("all");
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<AdminPhoto | null>(null);

  const filteredPhotos = photos.filter((photo) => {
    const matchesSearch = photo.uploaderName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "approved" && photo.approved) ||
      (filterStatus === "pending" && !photo.approved);
    return matchesSearch && matchesFilter;
  });

  const toggleApproval = (id: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, approved: !p.approved } : p))
    );
  };

  const toggleFeatured = (id: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, featured: !p.featured } : p))
    );
  };

  const handleDelete = (id: string) => {
    setPhotoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (photoToDelete) {
      setPhotos((prev) => prev.filter((p) => p.id !== photoToDelete));
      setPhotoToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const handleBulkDelete = () => {
    if (selectedPhotos.length > 0) {
      setDeleteDialogOpen(true);
    }
  };

  const confirmBulkDelete = () => {
    setPhotos((prev) => prev.filter((p) => !selectedPhotos.includes(p.id)));
    setSelectedPhotos([]);
    setDeleteDialogOpen(false);
  };

  const toggleSelectPhoto = (id: string) => {
    setSelectedPhotos((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedPhotos.length === filteredPhotos.length) {
      setSelectedPhotos([]);
    } else {
      setSelectedPhotos(filteredPhotos.map((p) => p.id));
    }
  };

  const stats = {
    total: photos.length,
    approved: photos.filter((p) => p.approved).length,
    pending: photos.filter((p) => !p.approved).length,
    featured: photos.filter((p) => p.featured).length,
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 font-sans text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <div className="h-6 w-px bg-border" />
            <h1 className="font-serif text-lg text-foreground">Admin Panel</h1>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="rounded-full font-sans"
          >
            <Download className="mr-1.5 h-4 w-4" />
            Download All
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Total Photos", value: stats.total, color: "bg-primary/10 text-primary" },
            { label: "Approved", value: stats.approved, color: "bg-green-500/10 text-green-600" },
            { label: "Pending", value: stats.pending, color: "bg-amber-500/10 text-amber-600" },
            { label: "Featured", value: stats.featured, color: "bg-blue-500/10 text-blue-600" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-xl border border-border bg-card p-4"
            >
              <p className="font-sans text-sm text-muted-foreground">{stat.label}</p>
              <p className={`mt-1 font-serif text-2xl ${stat.color.split(" ")[1]}`}>
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Filters & Controls */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-full border-border bg-card pl-10 font-sans"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full font-sans">
                  <Filter className="mr-1.5 h-4 w-4" />
                  {filterStatus === "all" ? "All" : filterStatus === "approved" ? "Approved" : "Pending"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterStatus("all")}>All Photos</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("approved")}>Approved</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("pending")}>Pending</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-3">
            {selectedPhotos.length > 0 && (
              <Button
                size="sm"
                variant="destructive"
                onClick={handleBulkDelete}
                className="rounded-full font-sans"
              >
                <Trash2 className="mr-1.5 h-4 w-4" />
                Delete ({selectedPhotos.length})
              </Button>
            )}
            <div className="flex rounded-full border border-border bg-card p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded-full p-1.5 transition-colors ${
                  viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`rounded-full p-1.5 transition-colors ${
                  viewMode === "table" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Select All */}
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={selectAll}
            className="flex items-center gap-2 font-sans text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <div className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
              selectedPhotos.length === filteredPhotos.length && filteredPhotos.length > 0
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border"
            }`}>
              {selectedPhotos.length === filteredPhotos.length && filteredPhotos.length > 0 && (
                <Check className="h-3 w-3" />
              )}
            </div>
            Select All ({filteredPhotos.length})
          </button>
        </div>

        {/* Grid View */}
        <AnimatePresence mode="wait">
          {viewMode === "grid" ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
            >
              {filteredPhotos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className={`group relative overflow-hidden rounded-xl border bg-card transition-all ${
                    selectedPhotos.includes(photo.id) ? "border-primary ring-2 ring-primary/20" : "border-border"
                  }`}
                >
                  {/* Selection checkbox */}
                  <button
                    onClick={() => toggleSelectPhoto(photo.id)}
                    className="absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full border bg-white/90 transition-colors hover:bg-white"
                  >
                    {selectedPhotos.includes(photo.id) ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <div className="h-4 w-4" />
                    )}
                  </button>

                  {/* Featured badge */}
                  {photo.featured && (
                    <div className="absolute right-2 top-2 z-10 rounded-full bg-primary px-2 py-0.5">
                      <Star className="h-3 w-3 text-primary-foreground" fill="currentColor" />
                    </div>
                  )}

                  {/* Image */}
                  <div className="relative aspect-square">
                    <Image
                      src={photo.url}
                      alt={`Photo by ${photo.uploaderName}`}
                      fill
                      className="object-cover"
                    />
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => setPreviewPhoto(photo)}
                        className="rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/30"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(photo.id)}
                        className="rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-red-500/80"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <p className="font-sans text-sm font-medium text-foreground truncate">
                      {photo.uploaderName}
                    </p>
                    <p className="mt-0.5 font-sans text-xs text-muted-foreground">
                      {photo.uploadedAt}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-sans text-xs text-muted-foreground">Approved</span>
                        <Switch
                          checked={photo.approved}
                          onCheckedChange={() => toggleApproval(photo.id)}
                          className="scale-75"
                        />
                      </div>
                      <button
                        onClick={() => toggleFeatured(photo.id)}
                        className={`rounded-full p-1 transition-colors ${
                          photo.featured ? "text-primary" : "text-muted-foreground hover:text-primary"
                        }`}
                      >
                        <Star className="h-4 w-4" fill={photo.featured ? "currentColor" : "none"} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="table"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-6 overflow-hidden rounded-xl border border-border bg-card"
            >
              <table className="w-full">
                <thead className="border-b border-border bg-muted/30">
                  <tr>
                    <th className="px-4 py-3 text-left font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Photo
                    </th>
                    <th className="px-4 py-3 text-left font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Uploader
                    </th>
                    <th className="px-4 py-3 text-left font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Featured
                    </th>
                    <th className="px-4 py-3 text-right font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredPhotos.map((photo) => (
                    <tr key={photo.id} className="transition-colors hover:bg-muted/20">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleSelectPhoto(photo.id)}
                            className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                              selectedPhotos.includes(photo.id)
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border"
                            }`}
                          >
                            {selectedPhotos.includes(photo.id) && <Check className="h-3 w-3" />}
                          </button>
                          <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-muted">
                            <Image
                              src={photo.url}
                              alt={`Photo by ${photo.uploaderName}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-sans text-sm text-foreground">
                        {photo.uploaderName}
                      </td>
                      <td className="px-4 py-3 font-sans text-sm text-muted-foreground">
                        {photo.uploadedAt}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={photo.approved}
                            onCheckedChange={() => toggleApproval(photo.id)}
                            className="scale-75"
                          />
                          <span className={`font-sans text-xs ${photo.approved ? "text-green-600" : "text-amber-600"}`}>
                            {photo.approved ? "Approved" : "Pending"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleFeatured(photo.id)}
                          className={`rounded-full p-1 transition-colors ${
                            photo.featured ? "text-primary" : "text-muted-foreground hover:text-primary"
                          }`}
                        >
                          <Star className="h-5 w-5" fill={photo.featured ? "currentColor" : "none"} />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setPreviewPhoto(photo)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(photo.id)} className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {filteredPhotos.length === 0 && (
          <div className="mt-12 text-center">
            <p className="font-sans text-muted-foreground">No photos found</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Confirm Delete</DialogTitle>
            <DialogDescription className="font-sans">
              {selectedPhotos.length > 0
                ? `Are you sure you want to delete ${selectedPhotos.length} selected photos? This action cannot be undone.`
                : "Are you sure you want to delete this photo? This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="font-sans">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={selectedPhotos.length > 0 ? confirmBulkDelete : confirmDelete}
              className="font-sans"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setPreviewPhoto(null)}
          >
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </button>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-h-[85vh] max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={previewPhoto.url}
                alt={`Photo by ${previewPhoto.uploaderName}`}
                width={1200}
                height={800}
                className="max-h-[85vh] w-auto rounded-lg object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-gradient-to-t from-black/80 to-transparent p-4">
                <p className="font-sans text-white">{previewPhoto.uploaderName}</p>
                <p className="font-sans text-sm text-white/70">{previewPhoto.uploadedAt}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
