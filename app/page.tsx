import { Download, FolderOpen, GraduationCap, Layers3, Rocket, Smartphone } from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ProjectsSection from "@/components/ProjectsSection";
import ProjectVisual from "@/components/ProjectVisual";
import DynamicSidebar from "@/components/DynamicSidebar";

const skills = ["Java Spring Boot", "Laravel", "Next.js", "ReactJS", "WordPress", "MySQL", "PostgreSQL", "Supabase", "REST API"];

export default function HomePage() {
  return (
    <>
      <Header active="home" />
      <main className="container page-shell">
        <section className="hero">
          <div className="hero-copy"><div className="hello">Xin chào! Mình là <b> Võ Đình Hội</b> 👋</div><h1><span>Công Nghệ Thông Tin</span></h1><p>Nơi lưu trữ và tải thông tin các dự án website, phần mềm và ứng dụng mình đã thực hiện.</p><div className="hero-actions"><a href="#projects" className="primary-button"><Rocket size={18}/>Xem dự án</a><a href="/documents/ho-so-nang-luc.txt" download className="outline-button"><Download size={18}/>Tải hồ sơ</a></div></div>
          <div className="hero-art"><div className="floating code">&lt;/&gt;</div><div className="floating braces">{'{}'}</div><div className="floating db">DB</div><ProjectVisual /></div>
        </section>
        <section className="stats">
          <div><FolderOpen/><strong>12+</strong><span>Dự án</span></div><div><Layers3/><strong>10+</strong><span>Công nghệ chính</span></div><div><GraduationCap/><strong>2</strong><span>năm học tập & thực hành</span></div><div><Smartphone/><strong>100%</strong><span>Responsive</span></div>
        </section>
        <div className="home-layout">
          <ProjectsSection />
          <DynamicSidebar />
        </div>
      </main>
      <Footer />
    </>
  );
}
