"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.user) {
      setMessage(error?.message || "Đăng nhập thất bại");
      setLoading(false);
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", data.user.id)
      .single();
    if (!profile?.is_admin) {
      await supabase.auth.signOut();
      setMessage("Tài khoản không có quyền Admin.");
      setLoading(false);
      return;
    }
    router.replace("/admin/dashboard");
  };
  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <div className="login-logo">
          <span className="brand-mark">HK</span>
          <div>
            <b>Profile Võ Đình Hội</b>
            <small>Khu vực quản trị</small>
          </div>
        </div>
        <div className="login-icon">
          <ShieldCheck />
        </div>
        <h1>Đăng nhập Admin</h1>
        <p>Quản lý dự án, kỹ năng và tài liệu hiển thị trên portfolio.</p>
        {!isSupabaseConfigured && (
          <div className="form-alert error">
            Chưa cấu hình Supabase trong file .env.local.
          </div>
        )}
        {message && <div className="form-alert error">{message}</div>}
        <form onSubmit={submit}>
          <label>
            Tài khoản
            <div className="input-icon">
              <Mail />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@example.com"
                autoComplete="username"
              />
            </div>
          </label>
          <label>
            Mật khẩu
            <div className="input-icon">
              <LockKeyhole />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
          </label>
          <button className="primary-button full" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
        <Link href="/">← Quay lại website</Link>
      </section>
    </main>
  );
}
