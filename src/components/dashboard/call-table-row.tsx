"use client";

import { useRouter } from "next/navigation";

export function CallTableRow({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <tr
      onClick={() => router.push(`/dashboard/calls/${id}`)}
      className="cursor-pointer border-b border-border/80 transition-colors last:border-0 hover:bg-muted/20"
    >
      {children}
    </tr>
  );
}
