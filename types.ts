export type Project = {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  description: string[];
  category: string;
  year: number;
  status: string;
  role: string;
  duration: string;
  accent: string;
  technologies: string[];
  learnings: string[];
  github_url: string | null;
  demo_url: string | null;
  cover_url: string | null;
  image_urls: string[];
  featured: boolean;
  published: boolean;
  created_at?: string;
};
export type ContactMessage = {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export type Skill = { id: string; name: string; category: string; level: number; icon_url: string | null; sort_order: number };
export type DocumentItem = { id: string; title: string; file_url: string; file_path: string; file_type: string | null; file_size: number | null; project_id: string | null; created_at?: string };
