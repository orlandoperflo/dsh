create extension if not exists pgcrypto;

create table agents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  goals jsonb not null,
  permissions jsonb not null,
  memory jsonb not null,
  escalation text,
  created_at timestamptz default now()
);

create table workflows (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  trigger text not null,
  automation text not null,
  owner text not null,
  created_at timestamptz default now()
);

create table workflow_steps (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid references workflows(id),
  step_order integer not null,
  label text not null,
  created_at timestamptz default now()
);

create table memory_records (
  id uuid primary key default gen_random_uuid(),
  namespace text not null,
  key text not null,
  value jsonb not null,
  created_at timestamptz default now()
);
