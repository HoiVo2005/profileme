"use client";
import { FormEvent, useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import { supabase } from "@/lib/supabase/client";
import type { Skill } from "@/types";

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
    if (confirm("Xóa kỹ năng?")) {
      await supabase.from("skills").delete().eq("id", id);
      if (editingId === id) cancelEdit();
      load();
    }
  };

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
        <div className="admin-two-column">
          <form className="admin-panel admin-form" onSubmit={submit}>
            <h2>{editingId ? "Sửa kỹ năng" : "Thêm kỹ năng"}</h2>
            <label>
              Tên kỹ năng
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>
            <label>
              Nhóm
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option>Frontend</option>
                <option>Backend</option>
                <option>Database</option>
                <option>Tools</option>
              </select>
            </label>
            <label>
              Mức độ: {form.level}%
              <input
                type="range"
                min="1"
                max="100"
                value={form.level}
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
                {saving ? "Đang lưu..." : editingId ? "Lưu thay đổi" : "Thêm kỹ năng"}
              </button>
              {editingId && (
                <button type="button" className="outline-button" onClick={cancelEdit}>
                  <X size={16} />
                  Hủy
                </button>
              )}
            </div>
          </form>
          <section className="admin-panel">
            <h2>Danh sách kỹ năng</h2>
            <div className="skill-admin-list">
              {items.map((s) => (
                <article key={s.id} className={editingId === s.id ? "editing" : ""}>
                  <div>
                    <b>{s.name}</b>
                    <small>{s.category}</small>
                  </div>
                  <div className="mini-progress">
                    <span style={{ width: `${s.level}%` }} />
                  </div>
                  <strong>{s.level}%</strong>
                  <button onClick={() => startEdit(s)} title="Sửa">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => remove(s.id)} title="Xóa">
                    <Trash2 size={16} />
                  </button>
                </article>
              ))}
            </div>
          </section>
        </div>
      </AdminShell>
    </AdminGuard>
  );
}
