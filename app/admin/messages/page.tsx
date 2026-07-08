"use client";
import { useEffect, useMemo, useState } from "react";
import { Mail, MailOpen, Trash2, Phone, Clock, X, Filter } from "lucide-react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import { supabase } from "@/lib/supabase/client";
import type { ContactMessage } from "@/types";

export default function AdminMessages() {
  const [items, setItems] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [active, setActive] = useState<ContactMessage | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    setItems((data || []) as ContactMessage[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 20000);
    return () => clearInterval(interval);
  }, []);

  const visible = useMemo(
    () => (filter === "unread" ? items.filter((m) => !m.is_read) : items),
    [items, filter]
  );

  const unreadCount = useMemo(() => items.filter((m) => !m.is_read).length, [items]);

  const openMessage = async (msg: ContactMessage) => {
    setActive(msg);
    if (!msg.is_read) {
      await supabase.from("contact_messages").update({ is_read: true }).eq("id", msg.id);
      load();
    }
  };

  const toggleRead = async (msg: ContactMessage) => {
    await supabase.from("contact_messages").update({ is_read: !msg.is_read }).eq("id", msg.id);
    load();
  };

  const remove = async (msg: ContactMessage) => {
    if (!confirm("Xóa tin nhắn này?")) return;
    await supabase.from("contact_messages").delete().eq("id", msg.id);
    if (active?.id === msg.id) setActive(null);
    load();
  };

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

  return (
    <AdminGuard>
      <AdminShell>
        <header className="admin-page-header">
          <div>
            <span>LIÊN HỆ</span>
            <h1>Tin nhắn từ khách</h1>
            <p>Danh sách các yêu cầu gửi từ form liên hệ trên website.</p>
          </div>
          <div className="message-filter-tabs">
            <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>
              Tất cả ({items.length})
            </button>
            <button className={filter === "unread" ? "active" : ""} onClick={() => setFilter("unread")}>
              <Filter size={14} /> Chưa đọc ({unreadCount})
            </button>
          </div>
        </header>

        <section className="admin-panel">
          {loading ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#9ca3af" }}>
              Đang tải...
            </div>
          ) : visible.length > 0 ? (
            <div className="message-list">
              {visible.map((msg) => (
                <article
                  key={msg.id}
                  className={`message-row${msg.is_read ? "" : " unread"}`}
                  onClick={() => openMessage(msg)}
                >
                  <span className="message-status-dot" />
                  <div className="message-main">
                    <div className="message-top">
                      <b>{msg.full_name}</b>
                      <span className="message-subject">{msg.subject || "Nội dung khác"}</span>
                    </div>
                    <p>{msg.message}</p>
                    <div className="message-meta">
                      <span><Mail size={13} />{msg.email}</span>
                      <span><Phone size={13} />{msg.phone}</span>
                      <span><Clock size={13} />{formatDate(msg.created_at)}</span>
                    </div>
                  </div>
                  <div className="row-actions" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => toggleRead(msg)} title={msg.is_read ? "Đánh dấu chưa đọc" : "Đánh dấu đã đọc"}>
                      {msg.is_read ? <Mail size={16} /> : <MailOpen size={16} />}
                    </button>
                    <button onClick={() => remove(msg)} title="Xóa">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div style={{ padding: "20px", color: "#9ca3af", textAlign: "center" }}>
              {filter === "unread" ? "Không có tin nhắn chưa đọc." : "Chưa có tin nhắn nào."}
            </div>
          )}
        </section>

        {active && (
          <div className="modal-backdrop" onClick={() => setActive(null)}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
              <header>
                <div>
                  <h2>{active.full_name}</h2>
                  <p>{active.subject || "Nội dung khác"}</p>
                </div>
                <button onClick={() => setActive(null)}><X size={18} /></button>
              </header>
              <div className="message-detail-meta">
                <span><Mail size={14} /> {active.email}</span>
                <span><Phone size={14} /> {active.phone}</span>
                <span><Clock size={14} /> {formatDate(active.created_at)}</span>
              </div>
              <p className="message-detail-body">{active.message}</p>
              <footer>
                <button onClick={() => remove(active)} className="danger-button">
                  <Trash2 size={16} /> Xóa tin nhắn
                </button>
                <a className="primary-button" href={`mailto:${active.email}`}>
                  Trả lời qua Email
                </a>
              </footer>
            </div>
          </div>
        )}
      </AdminShell>
    </AdminGuard>
  );
}
