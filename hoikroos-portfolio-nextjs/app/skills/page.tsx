"use client";
import Link from "next/link";
import {
  ArrowRight,
  Braces,
  Code2,
  Database,
  ServerCog,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { getFallbackSkills } from "@/lib/portfolio-data";
import type { Skill } from "@/types";
const icons: any = {
  Frontend: Code2,
  Backend: ServerCog,
  Database: Database,
  Tools: Braces,
};
export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setSkills(getFallbackSkills());
      return;
    }
    supabase
      .from("skills")
      .select("*")
      .order("sort_order")
      .then((result: { data: Skill[] | null; error: any }) => {
        setSkills((result.data || []) as Skill[]);
      });
  }, []);
  const groups = useMemo(
    () =>
      Object.entries(
        skills.reduce((acc: Record<string, Skill[]>, s: Skill) => {
          (acc[s.category] ??= []).push(s);
          return acc;
        }, {}),
      ),
    [skills],
  );
  return (
    <>
      <Header active="skills" />
      <main className="container inner-page">
        <section className="subpage-hero skills-hero">
          <div>
            <span className="eyebrow">
              <Sparkles size={16} /> Năng lực chuyên môn
            </span>
            <h1>Kỹ năng & Công nghệ</h1>
            <p>
              Danh sách kỹ năng được quản lý trực tiếp trong trang Admin và lưu
              trên Supabase.
            </p>
            <div className="hero-actions">
              <Link href="/#projects" className="primary-button">
                Xem dự án <ArrowRight size={17} />
              </Link>
              <Link href="/contact" className="outline-button">
                Liên hệ hợp tác
              </Link>
            </div>
          </div>
          <div className="skills-orbit">
            <div className="orbit-center">
              <Braces size={46} />
              <b>Full-stack</b>
            </div>
            {skills.slice(0, 4).map((s, i) => (
              <span
                className={`orbit-item ${["one", "two", "three", "four"][i]}`}
                key={s.id}
              >
                {s.name}
              </span>
            ))}
          </div>
        </section>
        <section className="skill-groups dynamic-skill-groups">
          {groups.map(([category, list]: [string, Skill[]]) => {
            const Icon = icons[category] || Code2;
            return (
              <article className="skill-panel" key={category}>
                <div className="skill-panel-head">
                  <span>
                    <Icon />
                  </span>
                  <div>
                    <h2>{category}</h2>
                    <p>Các công nghệ thuộc nhóm {category}.</p>
                  </div>
                </div>
                <div className="skill-bars">
                  {list.map((s: Skill) => (
                    <div className="skill-bar" key={s.id}>
                      <div>
                        <b>{s.name}</b>
                        <span>{s.level}%</span>
                      </div>
                      <div className="bar-track">
                        <i style={{ width: `${s.level}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </section>
        {!skills.length && <div className="empty-state">Chưa có kỹ năng.</div>}
      </main>
      <Footer />
    </>
  );
}
