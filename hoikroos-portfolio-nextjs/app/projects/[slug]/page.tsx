"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  Github,
  Layers3,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ProjectGallery from "@/components/ProjectGallery";
import ProjectVisual from "@/components/ProjectVisual";
import { supabase } from "@/lib/supabase/client";
import type { DocumentItem, Project } from "@/types";
export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .single();
      setProject(data as Project | null);
      if (data) {
        const d = await supabase
          .from("documents")
          .select("*")
          .eq("project_id", data.id)
          .order("created_at", { ascending: false });
        setDocs((d.data || []) as DocumentItem[]);
      }
      setLoading(false);
    })();
  }, [slug]);
  if (loading)
    return (
      <>
        <Header active="projects" />
        <main className="container detail-page">
          <div className="empty-state">Đang tải dự án...</div>
        </main>
      </>
    );
  if (!project)
    return (
      <>
        <Header active="projects" />
        <main className="container detail-page">
          <div className="empty-state">
            Không tìm thấy dự án hoặc dự án đang bị ẩn.
          </div>
        </main>
      </>
    );
  return (
    <>
      <Header active="projects" />
      <main className="container detail-page">
        <nav className="breadcrumb">
          <Link href="/">Trang chủ</Link>
          <span>/</span>
          <Link href="/#projects">Dự án</Link>
          <span>/</span>
          <b>{project.title}</b>
        </nav>
        <section className="detail-hero">
          <div>
            <span className="featured-badge">
              {project.featured ? "Dự án nổi bật" : project.category}
            </span>
            <h1>{project.title}</h1>
            <p>{project.short_description}</p>
            <div className="tags large">
              {project.technologies.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
            <div className="detail-actions">
              {project.demo_url && (
                <a
                  className="primary-button"
                  href={project.demo_url}
                  target="_blank"
                >
                  <ExternalLink />
                  Xem bản demo
                </a>
              )}
              {project.github_url && (
                <a
                  className="outline-button"
                  href={project.github_url}
                  target="_blank"
                >
                  <Github />
                  GitHub
                </a>
              )}
              {docs[0] && (
                <a
                  className="soft-button"
                  href={docs[0].file_url}
                  target="_blank"
                >
                  <Download />
                  Tải tài liệu
                </a>
              )}
            </div>
          </div>
          {project.cover_url ? (
            <img
              className="detail-cover"
              src={project.cover_url}
              alt={project.title}
            />
          ) : (
            <ProjectVisual type={project.accent} />
          )}
        </section>
        <div className="detail-layout">
          <div className="detail-main">
            <section className="content-card">
              <h2>Tổng quan dự án</h2>
              {project.description.map((x, i) => (
                <p key={i}>{x}</p>
              ))}
              <div className="project-meta">
                <div>
                  <UserRound />
                  <span>
                    Vai trò<b>{project.role}</b>
                  </span>
                </div>
                <div>
                  <CalendarDays />
                  <span>
                    Thời gian<b>{project.duration || "Đang cập nhật"}</b>
                  </span>
                </div>
                <div>
                  <Layers3 />
                  <span>
                    Năm thực hiện<b>{project.year}</b>
                  </span>
                </div>
                <div>
                  <CheckCircle2 />
                  <span>
                    Trạng thái<b>{project.status}</b>
                  </span>
                </div>
              </div>
            </section>
            {project.image_urls && project.image_urls.length > 0 && (
              <section className="content-card">
                <h2>Hình ảnh dự án</h2>
                <ProjectGallery
                  images={project.image_urls}
                  title={project.title}
                />
              </section>
            )}
            <section className="content-card">
              <h2>Những gì đã học được</h2>
              <div className="learning-grid">
                {project.learnings.map((x) => (
                  <div key={x}>
                    <CheckCircle2 />
                    {x}
                  </div>
                ))}
              </div>
            </section>
          </div>
          <aside className="detail-sidebar">
            <section className="sidebar-card">
              <h2>Thông tin dự án</h2>
              <dl>
                <div>
                  <dt>Loại dự án</dt>
                  <dd>{project.category}</dd>
                </div>
                <div>
                  <dt>Vai trò</dt>
                  <dd>{project.role}</dd>
                </div>
                <div>
                  <dt>Năm</dt>
                  <dd>{project.year}</dd>
                </div>
                <div>
                  <dt>Trạng thái</dt>
                  <dd>{project.status}</dd>
                </div>
              </dl>
            </section>
            <section className="sidebar-card">
              <h2>Tài liệu tải xuống</h2>
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
                  <Download />
                </a>
              ))}
              {!docs.length && <p>Chưa có tài liệu.</p>}
            </section>
          </aside>
        </div>
        <Link href="/#projects" className="back-link">
          <ArrowLeft />
          Quay lại danh sách dự án
        </Link>
      </main>
      <Footer />
    </>
  );
}
