"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Camera, Images } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";

interface EventPayload {
  id: string;
  eventName: string;
  coupleNames: string;
  eventDate: string;
}

export default function LandingPage() {
  const [event, setEvent] = useState<EventPayload | null>(null);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const response = await fetch("/api/event/current");
        const data = await response.json();

        if (response.ok) {
          setEvent(data.event);
        }
      } catch {
        // Keep the graceful fallback copy when no event is available yet.
      }
    };

    void loadEvent();
  }, []);

  const heading = event?.coupleNames || "Sasi & Tash";
  const subheading = event ? format(new Date(event.eventDate), "MMMM d, yyyy") : "May 02, 2026";
  const body = event
    ? `Help us capture every beautiful moment from ${event.eventName}.`
    : "Help us capture every beautiful moment from our special day.";

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/landing-wed-pic.jpeg"
          alt="Couple portrait background"
          fill
          sizes="100vw"
          className="scale-105 object-cover object-[52%_center] blur-[2px]"
          priority
          quality={100}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/34 via-black/52 to-black/74" />
      </div>

      <div className="absolute inset-y-0 right-0 z-[1] hidden items-center justify-end pr-6 lg:flex xl:pr-12">
        <Image
          src="/images/landing-wed-pic.jpeg"
          alt="Sasi and Tash portrait"
          width={860}
          height={1280}
          priority
          quality={100}
          className="h-[94vh] w-auto max-w-none object-contain object-right opacity-95 drop-shadow-2xl"
        />
        <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-black/55 to-transparent" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-12 lg:items-start lg:px-16 xl:px-24">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: "easeOut" }} className="flex max-w-lg flex-col items-center text-center lg:items-start lg:text-left">
          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }} className="mb-6">
            <div className="h-px w-24 bg-primary" />
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }} className="font-serif text-5xl font-medium tracking-wide text-white sm:text-6xl md:text-7xl">
            <span className="text-balance">{heading}</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.8 }} className="mt-4 font-sans text-lg font-light tracking-[0.3em] text-white/80">
            {subheading.toUpperCase()}
          </motion.p>

          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.8, duration: 0.6 }} className="my-8 flex items-center gap-4">
            <div className="h-px w-12 bg-primary/60" />
            <div className="h-2 w-2 rotate-45 border border-primary/60" />
            <div className="h-px w-12 bg-primary/60" />
          </motion.div>

          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.8 }} className="text-balance font-sans text-lg font-light leading-relaxed text-white/90 sm:text-xl">
            {body}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.8 }} className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link href="/upload">
              <Button size="lg" className="group relative min-w-[200px] overflow-hidden rounded-full bg-primary px-8 py-6 font-sans text-base font-medium tracking-wide text-primary-foreground shadow-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/20">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Camera className="h-5 w-5" />
                  Upload Photos
                </span>
                <span className="absolute inset-0 -z-0 bg-gradient-to-r from-primary via-primary/80 to-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </Button>
            </Link>

            <Link href="/gallery">
              <Button size="lg" variant="outline" className="min-w-[200px] rounded-full border-2 border-white/40 bg-white/10 px-8 py-6 font-sans text-base font-medium tracking-wide text-white backdrop-blur-sm transition-all duration-300 hover:border-white/60 hover:bg-white/20">
                <span className="flex items-center justify-center gap-2">
                  <Images className="h-5 w-5" />
                  View Gallery
                </span>
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 0.8 }} className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} className="flex flex-col items-center gap-2">
            <span className="font-sans text-xs tracking-widest text-white/60">SCROLL</span>
            <div className="h-8 w-px bg-gradient-to-b from-white/60 to-transparent" />
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
