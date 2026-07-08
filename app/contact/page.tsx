"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Facebook, Github, Linkedin, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase/client";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSending(true);
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const { error: insertError } = await supabase.from("contact_messages").insert({
        full_name: String(data.get("name") || ""),
        phone: String(data.get("phone") || ""),
        email: String(data.get("email") || ""),
        subject: String(data.get("subject") || ""),
        message: String(data.get("message") || ""),
      });
      if (insertError) throw insertError;
      setSent(true);
      form.reset();
    } catch (err: any) {
      setError(err?.message || "Gửi thất bại, vui lòng thử lại sau.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Header active="contact" />
      <main className="container inner-page">
        <section className="subpage-hero contact-hero">
          <div>
            <span className="eyebrow"><MessageCircle size={16}/> Kết nối với mình</span>
            <h1>Liên hệ hợp tác</h1>
            <p>Bạn cần xây dựng website, hệ thống quản lý hoặc muốn trao đổi về một dự án CNTT? Hãy gửi thông tin cho mình.</p>
          </div>
          <div className="contact-hero-card">
            <Mail size={32}/><span>Phản hồi trong thời gian sớm nhất</span><strong>vodinhhoi1@gmail.com</strong>
          </div>
        </section>

        <div className="contact-layout">
          <section className="contact-info-column">
            <article className="content-card contact-intro">
              <span className="eyebrow">Thông tin liên hệ</span>
              <h2>Hãy cùng biến ý tưởng thành sản phẩm</h2>
              <p>Mình quan tâm đến các dự án website quản lý, bán hàng, đặt phòng, bất động sản và những sản phẩm ứng dụng công nghệ vào thực tế.</p>
              <div className="contact-list">
                <a href="mailto:vodinhhoi1@gmail.com"><span><Mail/></span><div><small>Email</small><b>vodinhhoi1@gmail.com</b></div></a>
                <a href="tel:0969231454"><span><Phone/></span><div><small>Điện thoại</small><b>0969 231 454</b></div></a>
                <div><span><MapPin/></span><div><small>Khu vực</small><b>Phường Lái Thiêu, TP. Hồ Chí Minh, Việt Nam</b></div></div>
              </div>
              <div className="contact-socials">
                <a href="https://github.com/Hoikroos" target="_blank" rel="noreferrer"><Github/> GitHub</a>
                <a href="#"><Facebook/> Facebook</a>
              </div>
            </article>
          </section>

          <section className="content-card contact-form-card">
            <div className="section-heading"><div><span className="eyebrow"><Send size={15}/> Gửi lời nhắn</span><h2>Cho mình biết về dự án của bạn</h2></div></div>
            {sent && <div className="form-success"><CheckCircle2/> Đã gửi thông tin thành công. Mình sẽ liên hệ lại với bạn sớm nhất có thể.</div>}
            {error && <div className="form-error"><AlertCircle/> {error}</div>}
            <form className="contact-form" onSubmit={submit}>
              <div className="form-row">
                <label>Họ và tên<input name="name" required placeholder="Nhập họ và tên" /></label>
                <label>Số điện thoại<input name="phone" required placeholder="Nhập số điện thoại" /></label>
              </div>
              <label>Email<input type="email" name="email" required placeholder="example@gmail.com" /></label>
              <label>Chủ đề<select name="subject" defaultValue=""><option value="" disabled>Chọn nội dung cần trao đổi</option><option>Thiết kế website</option><option>Hệ thống quản lý</option><option>Hợp tác dự án</option><option>Nội dung khác</option></select></label>
              <label>Nội dung<textarea name="message" required rows={6} placeholder="Mô tả ngắn về ý tưởng hoặc yêu cầu của bạn..." /></label>
              <button className="primary-button submit-button" type="submit" disabled={sending}>
                <Send size={18}/> {sending ? "Đang gửi..." : "Gửi thông tin"}
              </button>
            </form>
          </section>
        </div>

        <section className="contact-bottom-banner">
          <div><b>Bạn muốn xem các sản phẩm mình đã thực hiện?</b><span>Khám phá danh sách dự án và tải tài liệu tham khảo.</span></div>
          <Link href="/#projects" className="outline-button">Xem các dự án</Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
