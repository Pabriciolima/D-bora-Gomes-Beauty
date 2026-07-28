-- Execute no SQL Editor do Supabase

update public.profiles
set
  business_id = 'cb7a2127-656d-4996-a124-dcb491d13f73',
  role = 'owner',
  name = 'Débora Gomes',
  email = 'pabriciolima1@gmail.com',
  phone = '91984361604',
  active = true,
  updated_at = now()
where id = '919d2ccc-34ee-480b-bbcb-b36f7cef00ba'
returning *;

create or replace function public.is_business_admin(requested_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and business_id = requested_business_id
      and role in ('owner', 'admin')
      and active = true
  );
$$;

drop policy if exists "admin manage services" on public.services;
create policy "admin manage services"
on public.services
for all
to authenticated
using (public.is_business_admin(business_id))
with check (public.is_business_admin(business_id));

drop policy if exists "admin view profiles" on public.profiles;
create policy "admin view profiles"
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.is_business_admin(business_id));

drop policy if exists "client links own profile to business" on public.profiles;
create policy "client links own profile to business"
on public.profiles
for update
to authenticated
using (id = auth.uid() and role = 'client')
with check (id = auth.uid() and role = 'client');

drop policy if exists "admin manage appointments" on public.appointments;
create policy "admin manage appointments"
on public.appointments
for all
to authenticated
using (public.is_business_admin(business_id))
with check (public.is_business_admin(business_id));

drop policy if exists "admin view payments" on public.payments;
create policy "admin view payments"
on public.payments
for select
to authenticated
using (client_id = auth.uid() or public.is_business_admin(business_id));
