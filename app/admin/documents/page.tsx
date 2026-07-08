"use client";
import { FormEvent, useEffect, useState } from "react";
import { Download, FileText, Pencil, Trash2, Upload, X } from "lucide-react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import { supabase } from "@/lib/supabase/client";
import type { DocumentItem, Project } from "@/types";

export default function AdminDocuments() {
  const [items, setItems] = useState<DocumentItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState({ title: "", project_id: "" });
  const [busy, setBusy] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", project_id: "" });
  const [savingEdit, setSavingEdit] = useState(false);

  const load = async () => {
    const { data: docs } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });
    const { data: prjs } = await supabase
      .from("projects")
      .select("id,title")
      .order("title");
    setItems((docs || []) as DocumentItem[]);
    setProjects((prjs || []) as Project[]);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const input = document.getElementById("document-file") as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return alert("Chọn file");

    setBusy(true);
    try {
      const filename = file.name.replace(/\s+/g, "-");
      const path = `documents/${Date.now()}-${filename}`;
      const { error: uploadError } = await supabase.storage
        .from("portfolio-documents")
        .upload(path, file);

      if (uploadError) throw uploadError;

      const url = supabase.storage
        .from("portfolio-documents")
        .getPublicUrl(path).data.publicUrl;
      const { error } = await supabase.from("documents").insert({
        title: form.title || file.name,
        file_url: url,
        file_path: path,
        file_type: file.type,
        file_size: file.size,
        project_id: form.project_id || null,
      });

      if (error) throw error;

      setForm({ title: "", project_id: "" });
      input.value = "";
      load();
    } catch (err: any) {
      alert(err.message || "Tải thất bại");
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (item: DocumentItem) => {
    setEditingId(item.id);
    setEditForm({ title: item.title, project_id: item.project_id || "" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ title: "", project_id: "" });
  };

  const saveEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setSavingEdit(true);
    try {
      const { error } = await supabase
        .from("documents")
        .update({
          title: editForm.title,
          project_id: editForm.project_id || null,
        })
        .eq("id", editingId);
      if (error) throw error;
      cancelEdit();
      load();
    } catch (err: any) {
      alert(err.message || "Lưu thất bại");
    } finally {
      setSavingEdit(false);
    }
  };

  const remove = async (item: DocumentItem) => {
    if (!confirm("Xóa tài liệu này?")) return;
    try {
      await supabase.storage
        .from("portfolio-documents")
        .remove([item.file_path]);
      await supabase.from("documents").delete().eq("id", item.id);
      if (editingId === item.id) cancelEdit();
      load();
    } catch (err: any) {
      alert(err.message || "Xóa thất bại");
    }
  };

  const getProjectTitle = (projectId: string | null) => {
    if (!projectId) return "Chung (không liên kết)";
    return projects.find((p) => p.id === projectId)?.title || "Không xác định";
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "-";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <AdminGuard>
      <AdminShell>
        <header className="admin-page-header">
          <div>
            <span>STORAGE</span>
            <h1>Quản lý tài liệu</h1>
            <p>Tải PDF, DOCX, ZIP hoặc tài liệu dự án lên Supabase Storage.</p>
          </div>
        </header>

        <div className="admin-two-column">
          <form className="admin-panel admin-form" onSubmit={submit}>
            <h2>Tải tài liệu mới</h2>
            <label>
              Tên hiển thị
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Báo cáo dự án / Hướng dẫn sử dụng"
              />
            </label>
            <label>
              Liên kết dự án (tùy chọn)
              <select
                value={form.project_id}
                onChange={(e) =>
                  setForm({ ...form, project_id: e.target.value })
                }
              >
                <option value="">Tài liệu chung</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="upload-field large">
              <Upload />
              Chọn file
              <input id="document-file" type="file" required />
            </label>
            <button className="primary-button" disabled={busy}>
              {busy ? "Đang tải..." : "Tải lên Supabase"}
            </button>
          </form>

          <section className="admin-panel">
            <h2>Tài liệu đã tải ({items.length})</h2>
            {items.length > 0 ? (
              <div className="document-list">
                {items.map((item) =>
                  editingId === item.id ? (
                    <form
                      key={item.id}
                      className="document-row document-row-editing"
                      onSubmit={saveEdit}
                    >
                      <div className="document-icon">
                        <FileText size={32} />
                      </div>
                      <div className="document-info" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <input
                          value={editForm.title}
                          onChange={(e) =>
                            setEditForm({ ...editForm, title: e.target.value })
                          }
                          placeholder="Tên hiển thị"
                          required
                        />
                        <select
                          value={editForm.project_id}
                          onChange={(e) =>
                            setEditForm({ ...editForm, project_id: e.target.value })
                          }
                        >
                          <option value="">Tài liệu chung</option>
                          {projects.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="document-actions">
                        <button type="submit" title="Lưu" disabled={savingEdit}>
                          <Pencil size={18} />
                        </button>
                        <button type="button" onClick={cancelEdit} title="Hủy">
                          <X size={18} />
                        </button>
                      </div>
                    </form>
                  ) : (
                    <article key={item.id} className="document-row">
                      <div className="document-icon">
                        <FileText size={32} />
                      </div>
                      <div className="document-info">
                        <b>{item.title}</b>
                        <small>{getProjectTitle(item.project_id)}</small>
                        <div className="document-meta">
                          <span>{item.file_type || "Tài liệu"}</span>
                          <span>{formatFileSize(item.file_size)}</span>
                        </div>
                      </div>
                      <div className="document-actions">
                        <a
                          href={item.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Tải xuống"
                        >
                          <Download size={18} />
                        </a>
                        <button onClick={() => startEdit(item)} title="Sửa">
                          <Pencil size={18} />
                        </button>
                        <button onClick={() => remove(item)} title="Xóa">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </article>
                  )
                )}
              </div>
            ) : (
              <p style={{ color: "#667085", marginTop: "20px" }}>
                Chưa có tài liệu nào. Hãy tải tài liệu đầu tiên.
              </p>
            )}
          </section>
        </div>
      </AdminShell>
    </AdminGuard>
  );
}
