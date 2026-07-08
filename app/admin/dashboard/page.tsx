"use client";
import { useEffect, useState } from "react";
import {
  FolderKanban,
  Sparkles,
  FileText,
  Eye,
  Globe,
  Smartphone,
  Clock,
  MapPin,
} from "lucide-react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import { supabase } from "@/lib/supabase/client";
import type { DocumentItem } from "@/types";

interface Visitor {
  id: string;
  page: string;
  referrer: string | null;
  user_agent: string;
  ip_address: string;
  country: string;
  city: string;
  device_type: string;
  created_at: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    projects: 0,
    skills: 0,
    documents: 0,
    published: 0,
    visitors: 0,
  });
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      // Get counts from Supabase
      const [p, s, d, pub, v, vTotal] = await Promise.all([
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase.from("skills").select("id", { count: "exact", head: true }),
        supabase.from("documents").select("id", { count: "exact", head: true }),
        supabase
          .from("projects")
          .select("id", { count: "exact", head: true })
          .eq("published", true),
        supabase
          .from("visitors")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50),
        supabase.from("visitors").select("id", { count: "exact", head: true }),
      ]);

      setStats({
        projects: p.count ?? 0,
        skills: s.count ?? 0,
        documents: d.count ?? 0,
        published: pub.count ?? 0,
        visitors: vTotal.count ?? (v.data || []).length,
      });

      setVisitors((v.data || []) as Visitor[]);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // Refresh visitors every 30 seconds
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins}p trước`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h trước`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d trước`;
    return date.toLocaleDateString("vi-VN");
  };

  const getPageLabel = (page: string) => {
    const labels: Record<string, string> = {
      "/": "Trang chủ",
      "/projects": "Dự án",
      "/skills": "Kỹ năng",
      "/contact": "Liên hệ",
    };
    return labels[page] || page;
  };

  return (
    <AdminGuard>
      <AdminShell>
        <header className="admin-page-header">
          <div>
            <span>TRANG QUẢN TRỊ</span>
            <h1>Tổng quan hệ thống</h1>
            <p>Thống kê dữ liệu và lịch sử truy cập từ Supabase.</p>
          </div>
        </header>

        {/* Statistics */}
        <section className="admin-stats">
          <article>
            <FolderKanban />
            <strong>{stats.projects}</strong>
            <span>Tổng dự án</span>
          </article>
          <article>
            <Eye />
            <strong>{stats.published}</strong>
            <span>Dự án công khai</span>
          </article>
          <article>
            <Sparkles />
            <strong>{stats.skills}</strong>
            <span>Kỹ năng</span>
          </article>
          <article>
            <FileText />
            <strong>{stats.documents}</strong>
            <span>Tài liệu</span>
          </article>
          <article>
            <Globe />
            <strong>{stats.visitors}</strong>
            <span>Lượt truy cập</span>
          </article>
        </section>

        {/* Visitor Activity */}
        <section className="admin-panel">
          <h2>Lịch sử truy cập gần đây</h2>
          <p
            style={{ color: "#667085", marginBottom: "16px", fontSize: "13px" }}
          >
            Hiển thị 50 lượt truy cập gần nhất từ người dùng
          </p>

          {loading ? (
            <div
              style={{ padding: "20px", textAlign: "center", color: "#9ca3af" }}
            >
              Đang tải...
            </div>
          ) : visitors.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table className="admin-table" style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th>Trang</th>
                    <th>Vị trí</th>
                    <th>Thiết bị</th>
                    <th>IP Address</th>
                    <th>Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {visitors.map((visitor) => (
                    <tr key={visitor.id}>
                      <td style={{ fontWeight: "500", color: "#1f2937" }}>
                        {getPageLabel(visitor.page)}
                      </td>
                      <td style={{ fontSize: "13px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <MapPin size={14} style={{ color: "#9ca3af" }} />
                          <span>
                            {visitor.city && visitor.country
                              ? `${visitor.city}, ${visitor.country}`
                              : visitor.country || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "13px",
                          }}
                        >
                          {visitor.device_type === "mobile" ? (
                            <>
                              <Smartphone
                                size={14}
                                style={{ color: "#9ca3af" }}
                              />
                              Mobile
                            </>
                          ) : (
                            <>
                              <Globe size={14} style={{ color: "#9ca3af" }} />
                              Desktop
                            </>
                          )}
                        </div>
                      </td>
                      <td
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          fontFamily: "monospace",
                        }}
                      >
                        {visitor.ip_address}
                      </td>
                      <td style={{ fontSize: "13px", color: "#9ca3af" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <Clock size={14} />
                          {formatDate(visitor.created_at)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div
              style={{ padding: "20px", color: "#9ca3af", textAlign: "center" }}
            >
              Chưa có lượt truy cập nào được ghi nhận
            </div>
          )}
        </section>

      </AdminShell>
    </AdminGuard>
  );
}
