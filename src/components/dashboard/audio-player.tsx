"use client";

import { Card } from "@/components/ui/card";

export function AudioPlayer({ src }: { src: string }) {
  return (
    <Card className="p-6">
      <p className="mb-4 text-sm font-semibold text-foreground">Recording</p>
      <audio
        controls
        preload="none"
        className="w-full accent-[#F97316]"
        src={src}
      >
        Your browser does not support audio playback.
      </audio>
      <a
        href={src}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
      >
        Open in new tab
      </a>
    </Card>
  );
}
