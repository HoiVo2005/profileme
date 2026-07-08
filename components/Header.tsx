"use client";

import Link from "next/link";
import {
  BriefcaseBusiness,
  Contact,
  Home,
  Menu,
  Moon,
  Sparkles,
  X,
} from "lucide-react";
import { useState } from "react";

type ActivePage = "home" | "projects" | "skills" | "contact";

export default function Header({ active = "home" }: { active?: ActivePage }) {
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" onClick={closeMenu}>
          <img
            src="/images/logo.svg"
            alt="HoiKroos Logo"
            className="brand-logo"
          />
          <span>
            HoiKroos <b>Portfolio</b>
          </span>
        </Link>

        <button
          className="mobile-menu"
          onClick={() => setOpen(!open)}
          aria-label="Mở menu"
        >
          {open ? <X /> : <Menu />}
        </button>

        <nav className={open ? "nav open" : "nav"}>
          <Link
            className={active === "home" ? "active" : ""}
            href="/"
            onClick={closeMenu}
          >
            <Home size={17} />
            Trang chủ
          </Link>
          <Link
            className={active === "projects" ? "active" : ""}
            href="/#projects"
            onClick={closeMenu}
          >
            <BriefcaseBusiness size={17} />
            Dự án
          </Link>
          <Link
            className={active === "skills" ? "active" : ""}
            href="/skills"
            onClick={closeMenu}
          >
            <Sparkles size={17} />
            Kỹ năng
          </Link>
          <Link
            className={active === "contact" ? "active" : ""}
            href="/contact"
            onClick={closeMenu}
          >
            <Contact size={17} />
            Liên hệ
          </Link>
        </nav>

        <button className="theme-button" aria-label="Chế độ tối">
          <Moon size={19} />
        </button>
      </div>
    </header>
  );
}
