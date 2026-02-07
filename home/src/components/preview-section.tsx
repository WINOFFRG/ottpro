"use client";

import type { StaticImport } from "next/dist/shared/lib/get-img-props";
import { useState } from "react";
import NetflixImage from "@/assets/netflix.png";
import PrimeVideoImage from "@/assets/prime_video.png";
import DefaultImage from "@/assets/default_all.png";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";

interface FeatureItem {
  title: string;
  isNew?: boolean;
  image: string | StaticImport;
  disabled?: boolean;
  capabilities?: string[];
}

const features: FeatureItem[] = [
  {
    title: "Netflix",
    image: NetflixImage,
    capabilities: [
      "Removes the device blocking screen",
      "Watch over any network now!",
    ],
  },
  {
    title: "Prime Video",
    isNew: true,
    image: PrimeVideoImage,
    capabilities: [
      "Bypass Lite Plan restrictions",
      "Watch 1080p FHD content on desktop",
      "Blocks all Ads during playback",
      "Blocks tracking and analytics",
    ],
  },
  {
    title: "Coming Soon",
    isNew: false,
    image: DefaultImage,
    disabled: true,
  },
];

export function PreviewSection() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | StaticImport>(
    DefaultImage,
  );
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleMouseEnter = (feature: FeatureItem, index: number) => {
    if (feature.disabled || isDialogOpen) return;
    setHoveredFeature(index);
    setCurrentImage(feature.image);
  };

  const handleMouseLeave = () => {
    if (isDialogOpen) return;
    setHoveredFeature(null);
    setCurrentImage(DefaultImage);
  };

  const handleFeatureClick = (feature: FeatureItem) => {
    if (feature.disabled || !isDesktop) return;
    setCurrentImage(feature.image);
    setIsDialogOpen(true);
  };

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open && !isDesktop) return;
        setIsDialogOpen(open);
      }}
      open={isDialogOpen}
    >
      <div className="mt-14 flex w-full max-w-6xl flex-col overflow-hidden border bg-background md:flex-row md:rounded-lg">
        <div className="order-1 flex min-h-[300px] w-full items-center justify-center overflow-hidden bg-muted/20 md:order-2 md:h-[500px] md:w-2/3">
          <DialogTrigger asChild>
            <div
              className="h-full w-full animate-in fade-in duration-500"
              key={
                typeof currentImage === "string"
                  ? currentImage
                  : (currentImage as any).src
              }
            >
              <Image
                alt="feature-preview"
                className="size-full object-cover object-left-top w-250"
                src={currentImage}
                width={800}
                height={600}
                priority
              />
            </div>
          </DialogTrigger>
        </div>
        <div className="order-2 flex w-full flex-col overflow-y-auto md:order-1 md:w-1/2 md:px-0">
          <ul className="will-change-transform">
            {features.map((feature, index) => (
              <li
                className="group border-white/10 border-b last:border-0"
                key={feature.title}
              >
                <button
                  className={cn(
                    "flex w-full flex-col items-start px-6 py-6 text-left transition-all duration-300 hover:bg-muted/50",
                    feature.disabled
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer",
                    hoveredFeature === index && "bg-muted/30",
                  )}
                  onClick={() => handleFeatureClick(feature)}
                  onMouseEnter={() => handleMouseEnter(feature, index)}
                  onMouseLeave={handleMouseLeave}
                  type="button"
                >
                  <h3
                    className={cn(
                      "flex items-center font-medium text-lg transition-colors",
                      hoveredFeature === index
                        ? "text-foreground"
                        : "text-zinc-500 dark:text-zinc-400",
                    )}
                  >
                    <span className="transition-colors group-hover:text-foreground">
                      {feature.title}
                    </span>
                    {feature.isNew && (
                      <span className="ml-3 inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-blue-500 text-xs font-medium shadow-[0_0_10px_-4px_rgba(59,130,246,0.5)]">
                        NEW
                      </span>
                    )}
                  </h3>
                  {hoveredFeature === index && feature.capabilities && (
                    <div className="animate-in fade-in slide-in-from-top-1 duration-300 overflow-hidden">
                      <ul className="mt-4 flex flex-wrap gap-2">
                        {feature.capabilities.map((capability) => (
                          <li
                            className="rounded-full border border-zinc-200/50 bg-zinc-100/50 px-3 py-1 text-zinc-600 text-xs backdrop-blur-sm dark:border-zinc-800/50 dark:bg-zinc-900/50 dark:text-zinc-400"
                            key={capability}
                          >
                            {capability}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <DialogContent
        className="flex min-h-screen min-w-screen items-center justify-center border-none bg-black/80 p-0 shadow-none backdrop-blur-xl"
        onClick={() => setIsDialogOpen(false)}
      >
        <div className="relative h-[85vh] w-full max-w-5xl overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10">
          <Image
            alt="feature-preview-large"
            className="h-full w-full object-contain"
            fill
            priority
            src={currentImage}
            sizes="100vw"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
