"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Mail, MailOpen } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import type { ContactMessage } from "@/types";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recent, setRecent] = useState<ContactMessage[]>([]);
  const boxRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    const [{ count }, { data }] = await Promise.all([
      supabase
        .from("contact_messages")
        .select("id", { count: "exact", head: true })
        .eq("is_read", false),
      supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6),
    ]);
    setUnreadCount(count ?? 0);
    setRecent((data || []) as ContactMessage[]);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const markRead = async (id: string) => {
    await supabase.from("contact_messages").update({ is_read: true }).eq("id", id);
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
    <div className="notification-bell" ref={boxRef}>
      <button
        className="notification-bell-trigger"
        onClick={() => setOpen((v) => !v)}
        title="Thông báo"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown">
          <header>
            <b>Thông báo liên hệ</b>
            {unreadCount > 0 && <span>{unreadCount} chưa đọc</span>}
          </header>
          <div className="notification-list">
            {recent.length > 0 ? (
              recent.map((msg) => (
                <button
                  key={msg.id}
                  className={`notification-item${msg.is_read ? "" : " unread"}`}
                  onClick={() => markRead(msg.id)}
                >
                  <span className="notification-icon">
                    {msg.is_read ? <MailOpen size={16} /> : <Mail size={16} />}
                  </span>
                  <span className="notification-content">
                    <b>{msg.full_name}</b>
                    <small>{msg.subject || "Nội dung khác"}</small>
                    <small className="notification-time">{formatDate(msg.created_at)}</small>
                  </span>
                </button>
              ))
            ) : (
              <p className="notification-empty">Chưa có tin nhắn nào.</p>
            )}
          </div>
          <footer>
            <Link href="/admin/messages" onClick={() => setOpen(false)}>
              Xem tất cả tin nhắn
            </Link>
          </footer>
        </div>
      )}
    </div>
  );
}
