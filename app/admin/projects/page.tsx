"use client";
import { FormEvent, useEffect, useState } from "react";
import { Edit3, Plus, Trash2, Upload, X } from "lucide-react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import { supabase } from "@/lib/supabase/client";
import type { Project } from "@/types";

type ProjectFormState = Project & {
  technologies_text?: string;
  learnings_text?: string;
  description_text?: string;
};

const empty: ProjectFormState = {
  id: "",
  slug: "",
  title: "",
  short_description: "",
  description: [""],
  category: "",
  year: new Date().getFullYear(),
  status: "Đang phát triển",
  role: "Full-stack Developer",
  duration: "",
  accent: "purple",
  technologies: [],
  learnings: [],
  github_url: "",
  demo_url: "",
  cover_url: "",
  image_urls: [],
  featured: false,
  published: true,
  technologies_text: "",
  learnings_text: "",
  description_text: "",
};

export default function AdminProjects() {
  const [items, setItems] = useState<Project[]>([]);
  const [form, setForm] = useState<ProjectFormState>(empty);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    setItems((data || []) as Project[]);
  };

  useEffect(() => {
    load();
  }, []);

  const uploadFile = async (
    file: File,
    bucket: "portfolio-images" | "portfolio-documents",
  ) => {
    const ext = file.name.split(".").pop();
    const path = `${bucket === "portfolio-images" ? "projects" : "documents"}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: false });
    if (error) throw error;
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      let cover = form.cover_url || "";
      const coverInput = document.getElementById(
        "cover-file",
      ) as HTMLInputElement | null;
      if (coverInput?.files?.[0]) {
        cover = await uploadFile(coverInput.files[0], "portfolio-images");
      }

      const imageFiles = Array.from(
        (document.getElementById("image-files") as HTMLInputElement | null)
          ?.files || [],
      );
      const documentFiles = Array.from(
        (document.getElementById("document-files") as HTMLInputElement | null)
          ?.files || [],
      );

      const uploadedImages = [] as string[];
      for (const file of imageFiles) {
        uploadedImages.push(await uploadFile(file, "portfolio-images"));
      }

      const uploadedDocuments = [] as string[];
      for (const file of documentFiles) {
        const fileUrl = await uploadFile(file, "portfolio-documents");
        uploadedDocuments.push(fileUrl);
      }

      const existingImages = (form.image_urls || []).filter(
        Boolean,
      ) as string[];
      const imageUrls = [...existingImages, cover, ...uploadedImages].filter(
        Boolean,
      );
      const {
        id,
        technologies_text,
        learnings_text,
        description_text,
        ...payload
      } = {
        ...form,
        cover_url: cover,
        image_urls: imageUrls,
        technologies: String(
          form.technologies_text ?? form.technologies?.join(", "),
        )
          .split(",")
          .map((x: string) => x.trim())
          .filter(Boolean),
        learnings: String(form.learnings_text ?? form.learnings?.join("\n"))
          .split("\n")
          .map((x: string) => x.trim())
          .filter(Boolean),
        description: String(
          form.description_text ?? form.description?.join("\n"),
        )
          .split("\n")
          .map((x: string) => x.trim())
          .filter(Boolean),
      };

      let projectId = form.id;
      if (form.id) {
        const { error } = await (
          supabase.from("projects").update(payload as any) as any
        ).eq("id", form.id);
        if (error) throw error;
      } else {
        const { data, error } = await (
          supabase.from("projects").insert(payload as any) as any
        )
          .select("id")
          .single();
        if (error) throw error;
        projectId = data?.id;
      }

      if (projectId && uploadedDocuments.length) {
        const documentRows = documentFiles.map((file, index) => ({
          project_id: projectId,
          title: file.name,
          file_url: uploadedDocuments[index],
          file_path: uploadedDocuments[index],
          file_type: file.type || "application/octet-stream",
          file_size: file.size,
        }));
        const { error: documentError } = await supabase
          .from("documents")
          .insert(documentRows);
        if (documentError) throw documentError;
      }

      setOpen(false);
      setForm(empty);
      await load();
    } catch (err: any) {
      alert(err.message || "Không thể lưu dự án");
    } finally {
      setBusy(false);
    }
  };

  const edit = (p: Project) => {
    setForm({
      ...p,
      technologies_text: p.technologies?.join(", "),
      learnings_text: p.learnings?.join("\n"),
      description_text: p.description?.join("\n"),
    });
    setOpen(true);
  };

  const remove = async (id: string) => {
    if (!confirm("Xóa dự án này?")) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) alert(error.message);
    else load();
  };
  return (
    <AdminGuard>
      <AdminShell>
        <header className="admin-page-header">
          <div>
            <span>NỘI DUNG</span>
            <h1>Quản lý dự án</h1>
            <p>Thêm, sửa, xóa và tải ảnh dự án thật lên Supabase.</p>
          </div>
          <button
            className="primary-button"
            onClick={() => {
              setForm(empty);
              setOpen(true);
            }}
          >
            <Plus />
            Thêm dự án
          </button>
        </header>
        <section className="admin-panel table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Dự án</th>
                <th>Công nghệ</th>
                <th>Năm</th>
                <th>Hiển thị</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="project-cell">
                      {p.cover_url ? (
                        <img src={p.cover_url} alt="" />
                      ) : (
                        <span className="project-placeholder">HK</span>
                      )}
                      <div>
                        <b>{p.title}</b>
                        <small>/{p.slug}</small>
                      </div>
                    </div>
                  </td>
                  <td>{p.technologies.slice(0, 3).join(", ")}</td>
                  <td>{p.year}</td>
                  <td>
                    <span className={p.published ? "status on" : "status"}>
                      {p.published ? "Công khai" : "Ẩn"}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button onClick={() => edit(p)}>
                        <Edit3 />
                      </button>
                      <button className="danger" onClick={() => remove(p.id)}>
                        <Trash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!items.length && (
            <div className="empty-admin">
              Chưa có dự án. Hãy thêm dự án đầu tiên.
            </div>
          )}
        </section>
        {open && (
          <div className="modal-backdrop">
            <form className="admin-modal" onSubmit={save}>
              <header>
                <div>
                  <h2>{form.id ? "Sửa dự án" : "Thêm dự án"}</h2>
                  <p>Nhập dữ liệu sẽ hiển thị trên portfolio.</p>
                </div>
                <button type="button" onClick={() => setOpen(false)}>
                  <X />
                </button>
              </header>
              <div className="form-grid">
                <label>
                  Tiêu đề
                  <input
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    required
                  />
                </label>
                <label>
                  Slug
                  <input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    required
                    placeholder="website-quan-ly"
                  />
                </label>
                <label className="full-field">
                  Mô tả ngắn
                  <textarea
                    value={form.short_description}
                    onChange={(e) =>
                      setForm({ ...form, short_description: e.target.value })
                    }
                    required
                  />
                </label>
                <label className="full-field">
                  Nội dung chi tiết, mỗi đoạn một dòng
                  <textarea
                    rows={4}
                    value={form.description_text ?? form.description.join("\n")}
                    onChange={(e) =>
                      setForm({ ...form, description_text: e.target.value })
                    }
                  />
                </label>
                <label>
                  Danh mục
                  <input
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                  />
                </label>
                <label>
                  Năm
                  <input
                    type="number"
                    value={form.year}
                    onChange={(e) =>
                      setForm({ ...form, year: Number(e.target.value) })
                    }
                  />
                </label>
                <label>
                  Vai trò
                  <input
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  />
                </label>
                <label>
                  Thời gian
                  <input
                    value={form.duration}
                    onChange={(e) =>
                      setForm({ ...form, duration: e.target.value })
                    }
                  />
                </label>
                <label className="full-field">
                  Công nghệ, cách nhau bằng dấu phẩy
                  <input
                    value={
                      form.technologies_text ?? form.technologies.join(", ")
                    }
                    onChange={(e) =>
                      setForm({ ...form, technologies_text: e.target.value })
                    }
                  />
                </label>
                <label className="full-field">
                  Bài học, mỗi ý một dòng
                  <textarea
                    rows={3}
                    value={form.learnings_text ?? form.learnings.join("\n")}
                    onChange={(e) =>
                      setForm({ ...form, learnings_text: e.target.value })
                    }
                  />
                </label>
                <label>
                  GitHub URL
                  <input
                    value={form.github_url || ""}
                    onChange={(e) =>
                      setForm({ ...form, github_url: e.target.value })
                    }
                  />
                </label>
                <label>
                  Demo URL
                  <input
                    value={form.demo_url || ""}
                    onChange={(e) =>
                      setForm({ ...form, demo_url: e.target.value })
                    }
                  />
                </label>
                <label className="upload-field">
                  <Upload />
                  Ảnh bìa (đại diện)
                  <input id="cover-file" type="file" accept="image/*" />
                </label>
                <label className="upload-field full-field">
                  <Upload />
                  Các ảnh khác của dự án
                  <input
                    id="image-files"
                    type="file"
                    accept="image/*"
                    multiple
                  />
                </label>
                {form.image_urls && form.image_urls.length > 0 && (
                  <div className="full-field">
                    <p
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        marginBottom: "0.5rem",
                      }}
                    >
                      Ảnh đã tải ({form.image_urls.length})
                    </p>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(100px, 1fr))",
                        gap: "0.75rem",
                      }}
                    >
                      {form.image_urls.map((url, idx) => (
                        <div
                          key={idx}
                          style={{
                            position: "relative",
                            border:
                              form.cover_url === url
                                ? "2px solid #4f46e5"
                                : "1px solid #e5e7eb",
                            borderRadius: "0.375rem",
                            overflow: "hidden",
                          }}
                        >
                          <img
                            src={url}
                            alt={`Project ${idx + 1}`}
                            style={{
                              width: "100%",
                              height: "100px",
                              objectFit: "cover",
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, cover_url: url })}
                            title="Chọn làm ảnh bìa"
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              width: "100%",
                              height: "100%",
                              backgroundColor:
                                form.cover_url === url
                                  ? "rgba(79, 70, 229, 0.3)"
                                  : "transparent",
                              border: "none",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0",
                            }}
                          >
                            {form.cover_url === url && (
                              <span
                                style={{ fontSize: "1rem", color: "white" }}
                              >
                                ✓
                              </span>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setForm({
                                ...form,
                                image_urls: form.image_urls.filter(
                                  (_, i) => i !== idx,
                                ),
                                cover_url:
                                  form.cover_url === url ? "" : form.cover_url,
                              })
                            }
                            title="Xóa ảnh"
                            style={{
                              position: "absolute",
                              top: "2px",
                              right: "2px",
                              width: "20px",
                              height: "20px",
                              padding: 0,
                              backgroundColor: "rgba(0, 0, 0, 0.5)",
                              border: "none",
                              borderRadius: "50%",
                              color: "white",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "12px",
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <label className="checkbox-field">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) =>
                      setForm({ ...form, featured: e.target.checked })
                    }
                  />
                  Dự án nổi bật
                </label>
                <label className="checkbox-field">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) =>
                      setForm({ ...form, published: e.target.checked })
                    }
                  />
                  Hiển thị công khai
                </label>
              </div>
              <footer>
                <button
                  type="button"
                  className="outline-button"
                  onClick={() => setOpen(false)}
                >
                  Hủy
                </button>
                <button className="primary-button" disabled={busy}>
                  {busy ? "Đang lưu..." : "Lưu dự án"}
                </button>
              </footer>
            </form>
          </div>
        )}
      </AdminShell>
    </AdminGuard>
  );
}
