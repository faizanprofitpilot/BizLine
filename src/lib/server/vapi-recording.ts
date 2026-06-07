import "server-only";

type VapiArtifact = {
  recording?: string | {
    stereoUrl?: string;
    mono?: { combinedUrl?: string };
  };
  stereoRecordingUrl?: string;
  recordingUrl?: string;
};

export function extractRecordingUrl(artifact: unknown): string | null {
  if (!artifact || typeof artifact !== "object") return null;

  const a = artifact as VapiArtifact;
  const recording = a.recording;

  if (typeof recording === "string" && recording.length > 0) {
    return recording;
  }

  if (recording && typeof recording === "object") {
    if (recording.stereoUrl) return recording.stereoUrl;
    if (recording.mono?.combinedUrl) return recording.mono.combinedUrl;
  }

  if (a.stereoRecordingUrl) return a.stereoRecordingUrl;
  if (a.recordingUrl) return a.recordingUrl;

  return null;
}

export function computeCallDurationSeconds(
  startedAt?: string,
  endedAt?: string
): number | null {
  if (!startedAt || !endedAt) return null;

  const start = Date.parse(startedAt);
  const end = Date.parse(endedAt);
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return null;

  return Math.round((end - start) / 1000);
}
