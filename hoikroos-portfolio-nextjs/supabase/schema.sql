-- Chạy toàn bộ file này trong Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id,email,full_name)
  values(new.id,new.email,coalesce(new.raw_user_meta_data->>'full_name',''))
  on conflict(id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and is_admin = true);
$$;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  short_description text not null default '',
  description text[] not null default '{}',
  category text not null default 'Website',
  year integer not null default extract(year from now())::integer,
  status text not null default 'Đang phát triển',
  role text not null default 'Full-stack Developer',
  duration text not null default '',
  accent text not null default 'purple',
  technologies text[] not null default '{}',
  learnings text[] not null default '{}',
  github_url text,
  demo_url text,
  cover_url text,
  image_urls text[] not null default '{}',
  featured boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_features (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text not null default '',
  icon text not null default 'code',
  sort_order integer not null default 0
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'Frontend',
  level integer not null default 80 check(level between 1 and 100),
  icon_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  file_url text not null,
  file_path text not null,
  file_type text,
  file_size bigint,
  created_at timestamptz not null default now()
);

create table if not exists public.visitors (
  id uuid primary key default gen_random_uuid(),
  page text not null,
  referrer text,
  user_agent text,
  ip_address text,
  country text,
  city text,
  device_type text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_features enable row level security;
alter table public.skills enable row level security;
alter table public.documents enable row level security;
alter table public.visitors enable row level security;

create policy "profile own read" on public.profiles for select to authenticated using(id=auth.uid());
create policy "published projects public read" on public.projects for select to anon, authenticated using(published=true or public.is_admin());
create policy "admin manage projects" on public.projects for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "features public read" on public.project_features for select to anon, authenticated using(exists(select 1 from public.projects p where p.id=project_id and (p.published=true or public.is_admin())));
create policy "admin manage features" on public.project_features for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "skills public read" on public.skills for select to anon, authenticated using(true);
create policy "admin manage skills" on public.skills for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "documents public read" on public.documents for select to anon, authenticated using(true);
create policy "admin manage documents" on public.documents for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "visitors public insert" on public.visitors for insert to anon, authenticated with check(true);
create policy "visitors admin read" on public.visitors for select to authenticated using(public.is_admin());

insert into storage.buckets(id,name,public) values('portfolio-images','portfolio-images',true) on conflict(id) do update set public=true;
insert into storage.buckets(id,name,public) values('portfolio-documents','portfolio-documents',true) on conflict(id) do update set public=true;

create policy "public view portfolio files" on storage.objects for select to public using(bucket_id in ('portfolio-images','portfolio-documents'));
create policy "admin upload portfolio files" on storage.objects for insert to authenticated with check(bucket_id in ('portfolio-images','portfolio-documents') and public.is_admin());
create policy "admin update portfolio files" on storage.objects for update to authenticated using(bucket_id in ('portfolio-images','portfolio-documents') and public.is_admin());
create policy "admin delete portfolio files" on storage.objects for delete to authenticated using(bucket_id in ('portfolio-images','portfolio-documents') and public.is_admin());

-- Sau khi tạo tài khoản trong Authentication > Users, đổi email bên dưới:
-- update public.profiles set is_admin=true where email='vodinhhoi1@gmail.com';
