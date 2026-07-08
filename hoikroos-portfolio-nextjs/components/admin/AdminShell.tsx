'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FolderKanban, Gauge, LogOut, Sparkles, FileText, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

const links = [
  ['/admin/dashboard','Tổng quan',Gauge],
  ['/admin/projects','Dự án',FolderKanban],
  ['/admin/skills','Kỹ năng',Sparkles],
  ['/admin/documents','Tài liệu',FileText],
] as const;
export default function AdminShell({children}:{children:React.ReactNode}){
  const path=usePathname(); const router=useRouter();
  const logout=async()=>{await supabase.auth.signOut();router.replace('/admin/login')};
  return <div className="admin-layout"><aside className="admin-sidebar"><Link href="/" className="brand admin-brand"><span className="brand-mark">HK</span><span>Portfolio <b>Admin</b></span></Link><nav>{links.map(([href,label,Icon])=><Link key={href} className={path===href?'active':''} href={href}><Icon size={18}/>{label}</Link>)}</nav><div className="admin-sidebar-bottom"><Link href="/" target="_blank"><ExternalLink size={17}/>Xem website</Link><button onClick={logout}><LogOut size={17}/>Đăng xuất</button></div></aside><main className="admin-main">{children}</main></div>
}
