"use client";
import Link from "next/link";
import { ArrowRight, Code2, Download, FileArchive,FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { getFallbackDocuments, getFallbackSkills } from "@/lib/portfolio-data";
import type { DocumentItem, Skill } from "@/types";
export default function DynamicSidebar() {
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  useEffect(() => {
    (async () => {
      if (!isSupabaseConfigured) {
        setDocs(getFallbackDocuments());
        setSkills(getFallbackSkills());
        return;
      }
      const [d, s] = await Promise.all([
        supabase
          .from("documents")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase.from("skills").select("*").order("sort_order").limit(9),
      ]);

      // Filter to only general documents (no project_id) and limit to 5
      const generalDocs = (d.data || [])
        .filter((doc: DocumentItem) => !doc.project_id)
        .slice(0, 5);
      setDocs(generalDocs as DocumentItem[]);
      setSkills((s.data || []) as Skill[]);
    })();
  }, []);
  return (
    <aside className="home-sidebar">
      <section className="sidebar-card">
        <div className="section-title">
          <h2>Tải tài liệu dự án</h2>
          <Download size={18} />
        </div>
        {docs.map((d) => (
          <a
            className="download-item"
            href={d.file_url}
            target="_blank"
            key={d.id}
          >
            <FileText />
            <span>
              <b>{d.title}</b>
            </span>
            <FileText />
          </a>
        ))}
        {!docs.length && <p className="sidebar-empty">Chưa có tài liệu.</p>}
      </section>
      <section className="sidebar-card" id="skills">
        <div className="section-title">
          <h2>Kỹ năng & Công nghệ</h2>
          <Code2 size={18} />
        </div>
        <div className="skills-grid">
          {skills.map((s) => (
            <span key={s.id}>{s.name}</span>
          ))}
        </div>
        <Link className="more-link" href="/skills">
          Xem chi tiết kỹ năng <ArrowRight size={15} />
        </Link>
      </section>
    </aside>
  );
}
