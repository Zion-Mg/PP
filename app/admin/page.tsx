"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
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
  LoaderCircle,
  Shield,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";

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

interface AdminPhoto {
  id: string;
  imageUrl: string;
  guestName?: string | null;
  createdAt: string;
  uploadedAt: string;
  isApproved: boolean;
  isFeatured: boolean;
}

type ViewMode = "grid" | "table";
type FilterMode = "all" | "approved" | "pending";

const ADMIN_TOKEN_KEY = "wedding-admin-token";

export default function AdminPage() {
  const [photos, setPhotos] = useState<AdminPhoto[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterMode>("all");
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<AdminPhoto | null>(null);
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);

  const loadPhotos = async (authToken: string) => {
    setIsLoadingPhotos(true);

    try {
      const response = await fetch("/api/admin/photos", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load uploaded photos.");
      }

      setPhotos(data.photos);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load uploaded photos.";
      toast.error(message);

      if (message.toLowerCase().includes("session")) {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        setToken("");
      }
    } finally {
      setIsLoadingPhotos(false);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (storedToken) {
      setToken(storedToken);
      void loadPhotos(storedToken);
    }
    setIsAuthLoading(false);
  }, []);

  const filteredPhotos = photos.filter((photo) => {
    const guest = photo.guestName ?? "anonymous";
    const matchesSearch = guest.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "approved" && photo.isApproved) ||
      (filterStatus === "pending" && !photo.isApproved);

    return matchesSearch && matchesFilter;
  });

  const authenticatedFetch = async (path: string, options: RequestInit = {}) => {
    const response = await fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.error || "Request failed.");
    }

    return data;
  };

  const handleLogin = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to sign in.");
      }

      localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      setToken(data.token);
      setPassword("");
      toast.success("Admin session started.");
      await loadPhotos(data.token);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to sign in.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleApproval = async (id: string) => {
    try {
      await authenticatedFetch("/api/admin/approve", {
        method: "POST",
        body: JSON.stringify({
          photoId: id,
          approve: !photos.find((photo) => photo.id === id)?.isApproved,
        }),
      });

      setPhotos((prev) =>
        prev.map((photo) => (photo.id === id ? { ...photo, isApproved: !photo.isApproved } : photo)),
      );
      toast.success("Photo approval updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update approval.");
    }
  };

  const toggleFeatured = async (id: string) => {
    try {
      await authenticatedFetch("/api/admin/feature", {
        method: "POST",
        body: JSON.stringify({
          photoId: id,
          feature: !photos.find((photo) => photo.id === id)?.isFeatured,
        }),
      });

      setPhotos((prev) =>
        prev.map((photo) => (photo.id === id ? { ...photo, isFeatured: !photo.isFeatured } : photo)),
      );
      toast.success("Photo feature status updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update feature status.");
    }
  };

  const handleDelete = (id: string) => {
    setPhotoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const deletePhoto = async (id: string) => {
    await authenticatedFetch("/api/admin/delete", {
      method: "DELETE",
      body: JSON.stringify({ photoId: id }),
    });
  };

  const confirmDelete = async () => {
    if (!photoToDelete) {
      return;
    }

    try {
      await deletePhoto(photoToDelete);
      setPhotos((prev) => prev.filter((photo) => photo.id !== photoToDelete));
      toast.success("Photo deleted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete photo.");
    } finally {
      setPhotoToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleBulkDelete = () => {
    if (selectedPhotos.length > 0) {
      setPhotoToDelete(null);
      setDeleteDialogOpen(true);
    }
  };

  const confirmBulkDelete = async () => {
    try {
      await Promise.all(selectedPhotos.map((id) => deletePhoto(id)));
      setPhotos((prev) => prev.filter((photo) => !selectedPhotos.includes(photo.id)));
      setSelectedPhotos([]);
      toast.success("Selected photos deleted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete selected photos.");
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const toggleSelectPhoto = (id: string) => {
    setSelectedPhotos((prev) => (prev.includes(id) ? prev.filter((photoId) => photoId !== id) : [...prev, id]));
  };

  const selectAll = () => {
    if (selectedPhotos.length === filteredPhotos.length) {
      setSelectedPhotos([]);
    } else {
      setSelectedPhotos(filteredPhotos.map((photo) => photo.id));
    }
  };

  const logout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setToken("");
    setPhotos([]);
    setSelectedPhotos([]);
    toast.success("Admin session ended.");
  };

  const downloadPhoto = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/download?photoId=${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Unable to download photo.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${id}.jpg`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to download photo.");
    }
  };

  const stats = {
    total: photos.length,
    approved: photos.filter((photo) => photo.isApproved).length,
    pending: photos.filter((photo) => !photo.isApproved).length,
    featured: photos.filter((photo) => photo.isFeatured).length,
  };

  if (isAuthLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
        Loading admin console...
      </main>
    );
  }

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <h1 className="font-serif text-3xl text-foreground">Admin Sign In</h1>
            <p className="mt-2 font-sans text-sm text-muted-foreground">Use your admin email and password to moderate uploads.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="font-sans text-sm text-foreground">Email</label>
              <Input value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 rounded-xl" placeholder="admin@example.com" />
            </div>
            <div>
              <label className="font-sans text-sm text-foreground">Password</label>
              <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 rounded-xl" placeholder="Your password" />
            </div>
            <Button onClick={handleLogin} disabled={!email || !password || isSubmitting} className="w-full rounded-full">
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
            <Link href="/" className="block text-center font-sans text-sm text-muted-foreground transition-colors hover:text-foreground">
              Back to homepage
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 font-sans text-sm text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <div className="h-6 w-px bg-border" />
            <h1 className="font-serif text-lg text-foreground">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => void (selectedPhotos[0] && downloadPhoto(selectedPhotos[0]))} disabled={selectedPhotos.length !== 1} className="rounded-full font-sans">
              <Download className="mr-1.5 h-4 w-4" />
              Download
            </Button>
            <Button size="sm" variant="outline" onClick={logout} className="rounded-full font-sans">
              <LogOut className="mr-1.5 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Total Photos", value: stats.total, color: "text-primary" },
            { label: "Approved", value: stats.approved, color: "text-green-600" },
            { label: "Pending", value: stats.pending, color: "text-amber-600" },
            { label: "Featured", value: stats.featured, color: "text-blue-600" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-xl border border-border bg-card p-4"
            >
              <p className="font-sans text-sm text-muted-foreground">{stat.label}</p>
              <p className={`mt-1 font-serif text-2xl ${stat.color}`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by guest name..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="rounded-full border-border bg-card pl-10 font-sans" />
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
              <Button size="sm" variant="destructive" onClick={handleBulkDelete} className="rounded-full font-sans">
                <Trash2 className="mr-1.5 h-4 w-4" />
                Delete ({selectedPhotos.length})
              </Button>
            )}
            <div className="flex rounded-full border border-border bg-card p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded-full p-1.5 transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`rounded-full p-1.5 transition-colors ${viewMode === "table" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button onClick={selectAll} className="flex items-center gap-2 font-sans text-sm text-muted-foreground transition-colors hover:text-foreground">
            <div className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${selectedPhotos.length === filteredPhotos.length && filteredPhotos.length > 0 ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
              {selectedPhotos.length === filteredPhotos.length && filteredPhotos.length > 0 && <Check className="h-3 w-3" />}
            </div>
            Select All ({filteredPhotos.length})
          </button>
        </div>

        {isLoadingPhotos ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
            Loading uploaded photos...
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {viewMode === "grid" ? (
              <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {filteredPhotos.map((photo, index) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className={`group relative overflow-hidden rounded-xl border bg-card transition-all ${selectedPhotos.includes(photo.id) ? "border-primary ring-2 ring-primary/20" : "border-border"}`}
                  >
                    <button onClick={() => toggleSelectPhoto(photo.id)} className="absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full border bg-white/90 transition-colors hover:bg-white">
                      {selectedPhotos.includes(photo.id) ? <Check className="h-4 w-4 text-primary" /> : <div className="h-4 w-4" />}
                    </button>

                    {photo.isFeatured && (
                      <div className="absolute right-2 top-2 z-10 rounded-full bg-primary px-2 py-0.5">
                        <Star className="h-3 w-3 text-primary-foreground" fill="currentColor" />
                      </div>
                    )}

                    <div className="relative aspect-square">
                      <img src={photo.imageUrl} alt={`Photo by ${photo.guestName || "guest"}`} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                        <button onClick={() => setPreviewPhoto(photo)} className="rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/30">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button onClick={() => void downloadPhoto(photo.id)} className="rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/30">
                          <Download className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(photo.id)} className="rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-red-500/80">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="p-3">
                      <p className="truncate font-sans text-sm font-medium text-foreground">{photo.guestName || "Anonymous guest"}</p>
                      <p className="mt-0.5 font-sans text-xs text-muted-foreground">{new Date(photo.createdAt).toLocaleString()}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-sans text-xs text-muted-foreground">Approved</span>
                          <Switch checked={photo.isApproved} onCheckedChange={() => toggleApproval(photo.id)} className="scale-75" />
                        </div>
                        <button onClick={() => toggleFeatured(photo.id)} className={`rounded-full p-1 transition-colors ${photo.isFeatured ? "text-primary" : "text-muted-foreground hover:text-primary"}`}>
                          <Star className="h-4 w-4" fill={photo.isFeatured ? "currentColor" : "none"} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
                <table className="w-full">
                  <thead className="border-b border-border bg-muted/30">
                    <tr>
                      <th className="px-4 py-3 text-left font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">Photo</th>
                      <th className="px-4 py-3 text-left font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">Uploader</th>
                      <th className="px-4 py-3 text-left font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">Date</th>
                      <th className="px-4 py-3 text-left font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-left font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">Featured</th>
                      <th className="px-4 py-3 text-right font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredPhotos.map((photo) => (
                      <tr key={photo.id} className="transition-colors hover:bg-muted/20">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <button onClick={() => toggleSelectPhoto(photo.id)} className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${selectedPhotos.includes(photo.id) ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
                              {selectedPhotos.includes(photo.id) && <Check className="h-3 w-3" />}
                            </button>
                            <div className="h-12 w-12 overflow-hidden rounded-lg bg-muted">
                              <img src={photo.imageUrl} alt={`Photo by ${photo.guestName || "guest"}`} className="h-full w-full object-cover" />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-sans text-sm text-foreground">{photo.guestName || "Anonymous guest"}</td>
                        <td className="px-4 py-3 font-sans text-sm text-muted-foreground">{new Date(photo.createdAt).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Switch checked={photo.isApproved} onCheckedChange={() => toggleApproval(photo.id)} className="scale-75" />
                            <span className={`font-sans text-xs ${photo.isApproved ? "text-green-600" : "text-amber-600"}`}>{photo.isApproved ? "Approved" : "Pending"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => toggleFeatured(photo.id)} className={`rounded-full p-1 transition-colors ${photo.isFeatured ? "text-primary" : "text-muted-foreground hover:text-primary"}`}>
                            <Star className="h-5 w-5" fill={photo.isFeatured ? "currentColor" : "none"} />
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
                              <DropdownMenuItem onClick={() => void downloadPhoto(photo.id)}>
                                <Download className="mr-2 h-4 w-4" />
                                Download
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
        )}

        {!isLoadingPhotos && filteredPhotos.length === 0 && (
          <div className="mt-12 text-center">
            <p className="font-sans text-muted-foreground">No photos found</p>
          </div>
        )}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Confirm Delete</DialogTitle>
            <DialogDescription className="font-sans">
              {selectedPhotos.length > 0 && !photoToDelete
                ? `Are you sure you want to delete ${selectedPhotos.length} selected photos? This action cannot be undone.`
                : "Are you sure you want to delete this photo? This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="font-sans">
              Cancel
            </Button>
            <Button variant="destructive" onClick={selectedPhotos.length > 0 && !photoToDelete ? confirmBulkDelete : confirmDelete} className="font-sans">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AnimatePresence>
        {previewPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setPreviewPhoto(null)}
          >
            <button onClick={() => setPreviewPhoto(null)} className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20">
              <X className="h-6 w-6" />
            </button>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="relative max-h-[85vh] max-w-[90vw]" onClick={(event) => event.stopPropagation()}>
              <img src={previewPhoto.imageUrl} alt={`Photo by ${previewPhoto.guestName || "guest"}`} className="max-h-[85vh] w-auto rounded-lg object-contain" />
              <div className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-gradient-to-t from-black/80 to-transparent p-4">
                <p className="font-sans text-white">{previewPhoto.guestName || "Anonymous guest"}</p>
                <p className="font-sans text-sm text-white/70">{new Date(previewPhoto.createdAt).toLocaleString()}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
