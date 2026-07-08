"use client";

import { usePathname } from "next/navigation";
import { useVisitorTracking } from "@/lib/useVisitorTracking";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Không theo dõi lượt truy cập trong khu vực quản trị — tránh việc
  // chính admin vào xem dashboard lại bị tính là "khách truy cập".
  const isAdminRoute = pathname?.startsWith("/admin");
  useVisitorTracking(isAdminRoute ? null : pathname);
  return <>{children}</>;
}
