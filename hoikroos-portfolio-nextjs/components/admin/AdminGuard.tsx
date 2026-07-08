'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return router.replace('/admin/login');
      const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', data.user.id).single();
      if (!profile?.is_admin) { await supabase.auth.signOut(); return router.replace('/admin/login?error=forbidden'); }
      setReady(true);
    })();
  }, [router]);
  if (!ready) return <div className="admin-loading">Đang kiểm tra quyền quản trị...</div>;
  return <>{children}</>;
}
