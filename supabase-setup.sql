-- Folio: one-time Supabase setup.
-- Paste all of this into Supabase → SQL Editor → New query, then press Run.
-- It is safe to run more than once.

-- 1. Each person's notes, folders and settings, stored as one JSON document.
create table if not exists public.folio_data (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.folio_data enable row level security;

-- People can only ever see and change their own row.
drop policy if exists "own data: read"   on public.folio_data;
drop policy if exists "own data: insert" on public.folio_data;
drop policy if exists "own data: update" on public.folio_data;
drop policy if exists "own data: delete" on public.folio_data;
create policy "own data: read"   on public.folio_data for select to authenticated using ((select auth.uid()) = user_id);
create policy "own data: insert" on public.folio_data for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own data: update" on public.folio_data for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own data: delete" on public.folio_data for delete to authenticated using ((select auth.uid()) = user_id);

-- 2. A private bucket for page photos and drawings.
--    Files live under a folder named after the person's user id.
insert into storage.buckets (id, name, public)
values ('folio-images', 'folio-images', false)
on conflict (id) do nothing;

drop policy if exists "folio images: read own"   on storage.objects;
drop policy if exists "folio images: add own"    on storage.objects;
drop policy if exists "folio images: change own" on storage.objects;
drop policy if exists "folio images: delete own" on storage.objects;
create policy "folio images: read own"   on storage.objects for select to authenticated
  using (bucket_id = 'folio-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "folio images: add own"    on storage.objects for insert to authenticated
  with check (bucket_id = 'folio-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "folio images: change own" on storage.objects for update to authenticated
  using (bucket_id = 'folio-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "folio images: delete own" on storage.objects for delete to authenticated
  using (bucket_id = 'folio-images' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- 3. "Delete my account" (Apple requires this to work from inside the app).
--    The app removes the person's images first, then calls this to remove
--    their login; their folio_data row is removed with it automatically.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
