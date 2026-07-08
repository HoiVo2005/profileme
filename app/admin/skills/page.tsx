"use client";
import { FormEvent, useMemo, useState, useEffect } from "react";
import {
  Cloud,
  Code2,
  Database,
  Layers,
  Pencil,
  Plus,
  Search,
  Server,
  Smartphone,
  Sparkles,
  Trash2,
  Wrench,
  X,
} from "lucide-react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import { supabase } from "@/lib/supabase/client";
import type { Skill } from "@/types";

const CATEGORY_OPTIONS = [
  "Frontend",
  "Backend",
  "Database",
  "DevOps",
  "Mobile",
  "Tools",
];

const CATEGORY_META: Record<
  string,
  { color: string; bg: string; icon: typeof Code2 }
> = {
  Frontend: { color: "#2563eb", bg: "#eaf1ff", icon: Code2 },
  Backend: { color: "#7c3aed", bg: "#f3edff", icon: Server },
  Database: { color: "#059669", bg: "#e7f9f1", icon: Database },
  DevOps: { color: "#0891b2", bg: "#e5f8fb", icon: Cloud },
  Mobile: { color: "#db2777", bg: "#fdeaf3", icon: Smartphone },
  Tools: { color: "#ea580c", bg: "#fff1e8", icon: Wrench },
};
const DEFAULT_META = { color: "#4f46e5", bg: "#eef2ff", icon: Sparkles };
const metaFor = (category: string) => CATEGORY_META[category] || DEFAULT_META;

const emptyForm = {
  name: "",
  category: "Frontend",
  level: 80,
  sort_order: 0,
};

export default function AdminSkills() {
  const [items, setItems] = useState<Skill[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");

  const load = async () => {
    const { data } = await supabase
      .from("skills")
      .select("*")
      .order("sort_order");
    setItems((data || []) as Skill[]);
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (s: Skill) => {
    setEditingId(s.id);
    setForm({
      name: s.name,
      category: s.category,
      level: s.level,
      sort_order: s.sort_order,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ ...emptyForm, sort_order: items.length });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const { error } = await supabase
          .from("skills")
          .update(form)
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("skills").insert(form);
        if (error) throw error;
      }
      cancelEdit();
      load();
    } catch (err: any) {
      alert(err.message || "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (confirm("Xóa kỹ năng này?")) {
      await supabase.from("skills").delete().eq("id", id);
      if (editingId === id) cancelEdit();
      load();
    }
  };

  const filtered = useMemo(
    () =>
      items.filter((s) =>
        s.name.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [items, query],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, Skill[]>();
    filtered.forEach((s) => {
      const list = map.get(s.category) || [];
      list.push(s);
      map.set(s.category, list);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const avgLevel = items.length
    ? Math.round(items.reduce((sum, s) => sum + s.level, 0) / items.length)
    : 0;
  const categoryCount = new Set(items.map((s) => s.category)).size;

  return (
    <AdminGuard>
      <AdminShell>
        <header className="admin-page-header">
          <div>
            <span>NỘI DUNG</span>
            <h1>Quản lý kỹ năng</h1>
            <p>Các kỹ năng này được hiển thị ở trang Kỹ năng.</p>
          </div>
        </header>

        <div className="stat-cards">
          <div className="stat-card">
            <span className="stat-icon" style={{ background: "#eef2ff", color: "#4f46e5" }}>
              <Layers size={18} />
            </span>
            <div>
              <small>Tổng kỹ năng</small>
              <strong>{items.length}</strong>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon" style={{ background: "#e7f9f1", color: "#059669" }}>
              <Sparkles size={18} />
            </span>
            <div>
              <small>Mức trung bình</small>
              <strong>{avgLevel}%</strong>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon" style={{ background: "#fff1e8", color: "#ea580c" }}>
              <Code2 size={18} />
            </span>
            <div>
              <small>Số nhóm kỹ năng</small>
              <strong>{categoryCount}</strong>
            </div>
          </div>
        </div>

        <div className="admin-two-column">
          <form className="admin-panel admin-form skill-form" onSubmit={submit}>
            <h2>{editingId ? "Sửa kỹ năng" : "Thêm kỹ năng mới"}</h2>

            <div className="skill-form-preview">
              <span
                className="skill-avatar-lg"
                style={{
                  background: metaFor(form.category).bg,
                  color: metaFor(form.category).color,
                }}
              >
                {form.name.trim().charAt(0).toUpperCase() || "?"}
              </span>
              <div>
                <b>{form.name || "Tên kỹ năng"}</b>
                <small>{form.category}</small>
              </div>
            </div>

            <label>
              Tên kỹ năng
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="VD: React, Node.js, PostgreSQL..."
                required
              />
            </label>

            <label>
              Nhóm kỹ năng
              <input
                list="skill-categories"
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
                placeholder="Chọn hoặc nhập nhóm khác"
              />
              <datalist id="skill-categories">
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </label>
            <div className="chip-group">
              {CATEGORY_OPTIONS.map((c) => {
                const meta = metaFor(c);
                const Icon = meta.icon;
                return (
                  <button
                    type="button"
                    key={c}
                    className={`chip ${form.category === c ? "active" : ""}`}
                    style={
                      form.category === c
                        ? { background: meta.color, borderColor: meta.color }
                        : undefined
                    }
                    onClick={() => setForm({ ...form, category: c })}
                  >
                    <Icon size={13} />
                    {c}
                  </button>
                );
              })}
            </div>

            <label>
              <span className="level-label-row">
                Mức độ thành thạo
                <strong style={{ color: metaFor(form.category).color }}>
                  {form.level}%
                </strong>
              </span>
              <input
                className="skill-range"
                type="range"
                min="1"
                max="100"
                value={form.level}
                style={
                  {
                    "--range-fill": metaFor(form.category).color,
                    background: `linear-gradient(90deg, ${metaFor(form.category).color} ${form.level}%, #e7eaf2 ${form.level}%)`,
                  } as React.CSSProperties
                }
                onChange={(e) =>
                  setForm({ ...form, level: Number(e.target.value) })
                }
              />
            </label>

            <label>
              Thứ tự hiển thị
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) =>
                  setForm({ ...form, sort_order: Number(e.target.value) })
                }
              />
            </label>

            <div style={{ display: "flex", gap: "8px" }}>
              <button className="primary-button" disabled={saving}>
                {editingId ? <Pencil size={16} /> : <Plus size={16} />}
                {saving
                  ? "Đang lưu..."
                  : editingId
                    ? "Lưu thay đổi"
                    : "Thêm kỹ năng"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="outline-button"
                  onClick={cancelEdit}
                >
                  <X size={16} />
                  Hủy
                </button>
              )}
            </div>
          </form>

          <section className="admin-panel">
            <div className="panel-head-row">
              <h2>Danh sách kỹ năng ({filtered.length})</h2>
              <div className="mini-search">
                <Search size={15} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm kỹ năng..."
                />
              </div>
            </div>

            {grouped.length === 0 && (
              <p className="empty-admin">Chưa có kỹ năng nào phù hợp.</p>
            )}

            {grouped.map(([category, skills]) => {
              const meta = metaFor(category);
              const Icon = meta.icon;
              return (
                <div className="skill-group" key={category}>
                  <div className="skill-group-head">
                    <span
                      className="skill-group-icon"
                      style={{ background: meta.bg, color: meta.color }}
                    >
                      <Icon size={15} />
                    </span>
                    <b>{category}</b>
                    <span className="skill-group-count">{skills.length}</span>
                  </div>
                  <div className="skill-card-grid">
                    {skills.map((s) => (
                      <article
                        key={s.id}
                        className={`skill-card ${editingId === s.id ? "editing" : ""}`}
                      >
                        <div className="skill-card-top">
                          <span
                            className="skill-avatar"
                            style={{ background: meta.bg, color: meta.color }}
                          >
                            {s.name.charAt(0).toUpperCase()}
                          </span>
                          <div className="skill-card-actions">
                            <button onClick={() => startEdit(s)} title="Sửa">
                              <Pencil size={13} />
                            </button>
                            <button onClick={() => remove(s.id)} title="Xóa">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                        <b className="skill-card-name">{s.name}</b>
                        <div className="skill-progress-row">
                          <div className="skill-progress-track">
                            <div
                              className="skill-progress-fill"
                              style={{
                                width: `${s.level}%`,
                                background: `linear-gradient(90deg, ${meta.color}, ${meta.color}cc)`,
                              }}
                            />
                          </div>
                          <span style={{ color: meta.color }}>{s.level}%</span>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              );
            })}
          </section>
        </div>
      </AdminShell>
    </AdminGuard>
  );
}
