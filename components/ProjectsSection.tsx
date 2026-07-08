"use client";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { getFallbackProjects } from "@/lib/portfolio-data";
import type { Project } from "@/types";
import ProjectCard from "./ProjectCard";
export default function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Tất cả");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      if (!isSupabaseConfigured) {
        setProjects(getFallbackProjects());
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("published", true)
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) {
        setProjects(getFallbackProjects());
      } else {
        setProjects((data || []) as Project[]);
      }
      setLoading(false);
    })();
  }, []);
  const filters = useMemo(
    () => [
      "Tất cả",
      ...Array.from(new Set(projects.flatMap((p) => p.technologies))).slice(
        0,
        7,
      ),
    ],
    [projects],
  );
  const list = useMemo(
    () =>
      projects.filter(
        (p) =>
          `${p.title} ${p.short_description} ${p.technologies.join(" ")}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (filter === "Tất cả" || p.technologies.includes(filter)),
      ),
    [projects, query, filter],
  );
  return (
    <section id="projects" className="projects-section">
      <div className="projects-toolbar">
        <label className="search-box">
          <Search size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm dự án..."
          />
        </label>
        <div className="filters">
          {filters.map((x) => (
            <button
              className={filter === x ? "active" : ""}
              key={x}
              onClick={() => setFilter(x)}
            >
              {x}
            </button>
          ))}
        </div>
      </div>
      {!isSupabaseConfigured && (
        <div className="empty-state">
          Đang hiển thị dữ liệu mẫu vì Supabase chưa được cấu hình. Hãy thêm
          biến môi trường trong <b>.env.local</b> để kết nối dữ liệu thật.
        </div>
      )}
      {loading ? (
        <div className="empty-state">Đang tải dự án...</div>
      ) : (
        <div className="projects-grid">
          {list.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
      {!loading && !list.length && isSupabaseConfigured && (
        <div className="empty-state">
          Chưa có dự án công khai. Hãy thêm dữ liệu.
        </div>
      )}
    </section>
  );
}
