"use client";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  File as FileIcon,
  FileArchive,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  HardDrive,
  Image as ImageIcon,
  Pencil,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import { supabase } from "@/lib/supabase/client";
import type { DocumentItem, Project } from "@/types";

const fileMeta = (fileType: string | null, title: string) => {
  const t = (fileType || "").toLowerCase();
  const name = title.toLowerCase();
  const is = (...exts: string[]) => exts.some((x) => t.includes(x) || name.endsWith(x));

  if (is("pdf"))
    return { icon: FileText, color: "#dc2626", bg: "#fef2f2", label: "PDF" };
  if (is("doc", "docx"))
    return { icon: FileText, color: "#2563eb", bg: "#eff6ff", label: "Word" };
  if (is("xls", "xlsx", "csv"))
    return {
      icon: FileSpreadsheet,
      color: "#059669",
      bg: "#ecfdf5",
      label: "Excel",
    };
  if (is("zip", "rar", "7z"))
    return {
      icon: FileArchive,
      color: "#ea580c",
      bg: "#fff7ed",
      label: "Nén",
    };
  if (is("png", "jpg", "jpeg", "webp", "gif", "svg"))
    return {
      icon: ImageIcon,
      color: "#7c3aed",
      bg: "#f5f3ff",
      label: "Ảnh",
    };
  return { icon: FileIcon, color: "#4b5563", bg: "#f3f4f6", label: "Tệp" };
};

const formatFileSize = (bytes: number | null) => {
  if (!bytes) return "-";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

export default function AdminDocuments() {
  const [items, setItems] = useState<DocumentItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState({ title: "", project_id: "" });
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pickedFile, setPickedFile] = useState<File | null>(null);

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

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPickedFile(file);
  };

  const clearPickedFile = () => {
    setPickedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!pickedFile) return alert("Chọn file");

    setBusy(true);
    try {
      const filename = pickedFile.name.replace(/\s+/g, "-");
      const path = `documents/${Date.now()}-${filename}`;
      const { error: uploadError } = await supabase.storage
        .from("portfolio-documents")
        .upload(path, pickedFile);

      if (uploadError) throw uploadError;

      const url = supabase.storage
        .from("portfolio-documents")
        .getPublicUrl(path).data.publicUrl;
      const { error } = await supabase.from("documents").insert({
        title: form.title || pickedFile.name,
        file_url: url,
        file_path: path,
        file_type: pickedFile.type,
        file_size: pickedFile.size,
        project_id: form.project_id || null,
      });

      if (error) throw error;

      setForm({ title: "", project_id: "" });
      clearPickedFile();
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

  const filtered = useMemo(
    () =>
      items.filter((item) =>
        item.title.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [items, query],
  );

  const totalSize = items.reduce((sum, i) => sum + (i.file_size || 0), 0);
  const linkedProjects = new Set(
    items.filter((i) => i.project_id).map((i) => i.project_id),
  ).size;

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

        <div className="stat-cards">
          <div className="stat-card">
            <span
              className="stat-icon"
              style={{ background: "#eef2ff", color: "#4f46e5" }}
            >
              <FileText size={18} />
            </span>
            <div>
              <small>Tổng tài liệu</small>
              <strong>{items.length}</strong>
            </div>
          </div>
          <div className="stat-card">
            <span
              className="stat-icon"
              style={{ background: "#e7f9f1", color: "#059669" }}
            >
              <HardDrive size={18} />
            </span>
            <div>
              <small>Tổng dung lượng</small>
              <strong>{formatFileSize(totalSize)}</strong>
            </div>
          </div>
          <div className="stat-card">
            <span
              className="stat-icon"
              style={{ background: "#fff1e8", color: "#ea580c" }}
            >
              <FolderOpen size={18} />
            </span>
            <div>
              <small>Dự án có tài liệu</small>
              <strong>{linkedProjects}</strong>
            </div>
          </div>
        </div>

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

            <div className="upload-block">
              <span className="upload-block-label">
                <Upload size={16} />
                Tệp tài liệu
              </span>
              <input
                ref={fileInputRef}
                id="document-file"
                type="file"
                onChange={onPickFile}
                hidden
              />
              {pickedFile ? (
                (() => {
                  const meta = fileMeta(pickedFile.type, pickedFile.name);
                  const Icon = meta.icon;
                  return (
                    <div className="picked-file-row">
                      <span
                        className="picked-file-icon"
                        style={{ background: meta.bg, color: meta.color }}
                      >
                        <Icon size={20} />
                      </span>
                      <div className="picked-file-info">
                        <b>{pickedFile.name}</b>
                        <small>{formatFileSize(pickedFile.size)}</small>
                      </div>
                      <button
                        type="button"
                        className="upload-remove-btn upload-remove-btn-static"
                        onClick={clearPickedFile}
                        title="Hủy chọn file"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })()
              ) : (
                <button
                  type="button"
                  className="upload-dropzone"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={22} />
                  <span>Chọn tệp để tải lên</span>
                  <small>PDF, DOCX, XLSX, ZIP...</small>
                </button>
              )}
            </div>

            <button className="primary-button" disabled={busy}>
              {busy ? "Đang tải..." : "Tải lên Supabase"}
            </button>
          </form>

          <section className="admin-panel">
            <div className="panel-head-row">
              <h2>Tài liệu đã tải ({filtered.length})</h2>
              <div className="mini-search">
                <Search size={15} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm tài liệu..."
                />
              </div>
            </div>
            {filtered.length > 0 ? (
              <div className="document-list">
                {filtered.map((item) => {
                  const meta = fileMeta(item.file_type, item.title);
                  const Icon = meta.icon;
                  return editingId === item.id ? (
                    <form
                      key={item.id}
                      className="document-row document-row-editing"
                      onSubmit={saveEdit}
                    >
                      <div
                        className="document-icon"
                        style={{ background: meta.bg, color: meta.color }}
                      >
                        <Icon size={22} />
                      </div>
                      <div
                        className="document-info"
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                      >
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
                            setEditForm({
                              ...editForm,
                              project_id: e.target.value,
                            })
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
                      <div
                        className="document-icon"
                        style={{ background: meta.bg, color: meta.color }}
                      >
                        <Icon size={22} />
                      </div>
                      <div className="document-info">
                        <b>{item.title}</b>
                        <small>{getProjectTitle(item.project_id)}</small>
                        <div className="document-meta">
                          <span
                            className="file-type-badge"
                            style={{ background: meta.bg, color: meta.color }}
                          >
                            {meta.label}
                          </span>
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
                  );
                })}
              </div>
            ) : (
              <p className="empty-admin">
                {items.length === 0
                  ? "Chưa có tài liệu nào. Hãy tải tài liệu đầu tiên."
                  : "Không tìm thấy tài liệu phù hợp."}
              </p>
            )}
          </section>
        </div>
      </AdminShell>
    </AdminGuard>
  );
}
