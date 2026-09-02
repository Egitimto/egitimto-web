create extension if not exists "pgcrypto";

create table public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('admin', 'moderator')),
  created_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('beyanname', 'faaliyet_raporu')),
  title text not null,
  year integer not null,
  pdf_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index documents_type_year_idx on public.documents (type, year desc);

create table public.about_content (
  id integer primary key default 1,
  tuzuk_pdf_url text,
  amac_ilkeler_tr text not null default '',
  amac_ilkeler_en text not null default '',
  updated_at timestamptz not null default now(),
  constraint about_content_singleton check (id = 1)
);
insert into public.about_content (id) values (1);

create table public.team_categories (
  id uuid primary key default gen_random_uuid(),
  name_tr text not null,
  name_en text not null,
  sort_order integer not null default 0
);

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.team_categories (id) on delete cascade,
  full_name text not null,
  role_tr text not null,
  role_en text not null,
  photo_url text,
  email text,
  social_links jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0
);
create index team_members_category_id_idx on public.team_members (category_id);

create table public.partnerships (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  project_description_tr text not null default '',
  project_description_en text not null default '',
  logo_url text not null,
  sort_order integer not null default 0
);

create table public.news (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_tr text not null,
  title_en text not null,
  content_tr text not null default '',
  content_en text not null default '',
  cover_image text,
  published_at timestamptz,
  show_apply_button boolean not null default false,
  apply_button_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);
create index news_is_published_published_at_idx on public.news (is_published, published_at desc);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_tr text not null,
  title_en text not null,
  content_tr text not null default '',
  content_en text not null default '',
  cover_image text,
  event_date date,
  location text,
  published_at timestamptz,
  show_apply_button boolean not null default false,
  apply_button_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);
create index events_is_published_event_date_idx on public.events (is_published, event_date desc);
