"use client";

import { useVisitorTracking } from "@/lib/useVisitorTracking";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  useVisitorTracking();
  return <>{children}</>;
}
