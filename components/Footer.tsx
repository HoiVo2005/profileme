import { Facebook, Github, Linkedin, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="container footer-grid">
        <div><div className="brand footer-brand"><span className="brand-mark">HK</span><span>HoiKroos</span></div><p>© 2026 HoiKroos. All rights reserved.</p></div>
        <div><h4>Liên hệ</h4><p><Mail size={16}/> vodinhhoi1@gmail.com</p><p><Phone size={16}/> 0969 231 454</p><p><MapPin size={16}/> Việt Nam</p></div>
        <div><h4>Kết nối với mình</h4><div className="socials"><a href="https://github.com/Hoikroos"><Github/></a><a href="#"><Facebook/></a></div></div>
        <blockquote>“Học hỏi mỗi ngày, xây dựng tương lai bằng công nghệ hiện đại.”</blockquote>
      </div>
    </footer>
  );
}
