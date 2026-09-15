create table if not exists world_scans (
  id text primary key,
  mineral_id text not null,
  created_at timestamptz not null default now()
);

create index if not exists world_scans_created_at_idx on world_scans (created_at desc);
create index if not exists world_scans_mineral_idx on world_scans (mineral_id);
