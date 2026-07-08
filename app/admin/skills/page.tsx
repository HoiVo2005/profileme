"use client";
import { FormEvent, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import { supabase } from "@/lib/supabase/client";
import type { Skill } from "@/types";

export default function AdminSkills() {
  const [items, setItems] = useState<Skill[]>([]);
  const [form, setForm] = useState({
    name: "",
    category: "Frontend",
    level: 80,
    sort_order: 0,
  });

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

  const add = async (e: FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("skills").insert(form);
    if (error) alert(error.message);
    else {
      setForm({
        name: "",
        category: "Frontend",
        level: 80,
        sort_order: items.length,
      });
      load();
    }
  };

  const remove = async (id: string) => {
    if (confirm("Xóa kỹ năng?")) {
      await supabase.from("skills").delete().eq("id", id);
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
          <form className="admin-panel admin-form" onSubmit={add}>
            <h2>Thêm kỹ năng</h2>
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
            <button className="primary-button">
              <Plus />
              Thêm kỹ năng
            </button>
          </form>
          <section className="admin-panel">
            <h2>Danh sách kỹ năng</h2>
            <div className="skill-admin-list">
              {items.map((s) => (
                <article key={s.id}>
                  <div>
                    <b>{s.name}</b>
                    <small>{s.category}</small>
                  </div>
                  <div className="mini-progress">
                    <span style={{ width: `${s.level}%` }} />
                  </div>
                  <strong>{s.level}%</strong>
                  <button onClick={() => remove(s.id)}>
                    <Trash2 />
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
