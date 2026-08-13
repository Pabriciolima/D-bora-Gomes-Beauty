-- ============================================================
-- DÉBORA GOMES BEAUTY — SUPABASE DO ZERO
-- ============================================================

create extension if not exists pgcrypto;
create extension if not exists btree_gist;

do $$ begin
  create type public.user_role as enum ('owner','admin','client');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.appointment_status as enum ('pending','confirmed','completed','cancelled');
exception when duplicate_object then null; end $$;

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  email text,
  phone text,
  logo_url text,
  default_deposit_percentage numeric(5,2) not null default 50,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  role public.user_role not null default 'client',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  description text,
  price numeric(10,2) not null default 0,
  duration_minutes integer not null default 90,
  deposit_percentage numeric(5,2) not null default 50,
  interval_after_minutes integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, name)
);

create table if not exists public.business_hours (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  weekday integer not null check (weekday between 0 and 6),
  opening_time time,
  closing_time time,
  lunch_start time,
  lunch_end time,
  active boolean not null default true,
  unique (business_id, weekday)
);

create table if not exists public.blocked_periods (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz not null,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  client_id uuid not null references auth.users(id) on delete cascade,
  service_id uuid not null references public.services(id),
  start_at timestamptz not null,
  end_at timestamptz not null,
  total_amount numeric(10,2) not null default 0,
  deposit_amount numeric(10,2) not null default 0,
  remaining_amount numeric(10,2) not null default 0,
  status public.appointment_status not null default 'pending',
  payment_status text not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  appointment_id uuid references public.appointments(id) on delete cascade,
  client_id uuid references auth.users(id) on delete cascade,
  provider text not null default 'asaas',
  provider_payment_id text unique,
  amount numeric(10,2) not null default 0,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$ begin
  alter table public.appointments
  add constraint appointments_no_overlap
  exclude using gist (
    business_id with =,
    tstzrange(start_at,end_at,'[)') with &&
  )
  where (status in ('pending','confirmed'));
exception when duplicate_object then null; end $$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles(id,name,email,phone,role)
  values(
    new.id,
    coalesce(new.raw_user_meta_data->>'name','Cliente'),
    new.email,
    new.raw_user_meta_data->>'phone',
    'client'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.businesses enable row level security;
alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.business_hours enable row level security;
alter table public.blocked_periods enable row level security;
alter table public.appointments enable row level security;
alter table public.payments enable row level security;

create or replace function public.is_business_admin(bid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.profiles
    where id=auth.uid()
      and business_id=bid
      and role in ('owner','admin')
      and active=true
  );
$$;

drop policy if exists "public business" on public.businesses;
create policy "public business" on public.businesses for select using(active=true);

drop policy if exists "public services" on public.services;
create policy "public services" on public.services for select using(active=true);

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles for select to authenticated using(id=auth.uid() or public.is_business_admin(business_id));

drop policy if exists "own profile update" on public.profiles;
create policy "own profile update" on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());

drop policy if exists "admin services" on public.services;
create policy "admin services" on public.services for all to authenticated using(public.is_business_admin(business_id)) with check(public.is_business_admin(business_id));

drop policy if exists "appointments read" on public.appointments;
create policy "appointments read" on public.appointments for select to authenticated using(client_id=auth.uid() or public.is_business_admin(business_id));

drop policy if exists "appointments admin" on public.appointments;
create policy "appointments admin" on public.appointments for update to authenticated using(public.is_business_admin(business_id)) with check(public.is_business_admin(business_id));

drop policy if exists "payments read" on public.payments;
create policy "payments read" on public.payments for select to authenticated using(client_id=auth.uid() or public.is_business_admin(business_id));

create or replace function public.get_available_slots(p_service_id uuid,p_date date)
returns table(slot_start timestamptz)
language plpgsql
security definer
set search_path=''
as $$
declare
  bid uuid; dur integer; buffer integer; op time; cl time; ls time; le time; act boolean; dow integer;
  slot timestamp; slot_end timestamp; tz text:='America/Belem';
begin
  select business_id,duration_minutes,coalesce(interval_after_minutes,0)
  into bid,dur,buffer
  from public.services where id=p_service_id and active=true;

  dow:=extract(dow from p_date)::int;

  select opening_time,closing_time,lunch_start,lunch_end,active
  into op,cl,ls,le,act
  from public.business_hours
  where business_id=bid and weekday=dow;

  if coalesce(act,false)=false or op is null or cl is null then return; end if;

  slot:=p_date+op;

  while slot+make_interval(mins=>dur+buffer)<=p_date+cl loop
    slot_end:=slot+make_interval(mins=>dur+buffer);

    if slot>(now() at time zone tz)
      and not(ls is not null and le is not null and slot::time<le and slot_end::time>ls)
      and not exists(
        select 1 from public.blocked_periods b
        where b.business_id=bid
          and tstzrange(slot at time zone tz,slot_end at time zone tz,'[)')
              && tstzrange(b.start_at,b.end_at,'[)')
      )
      and not exists(
        select 1 from public.appointments a
        where a.business_id=bid
          and a.status in('pending','confirmed')
          and tstzrange(slot at time zone tz,slot_end at time zone tz,'[)')
              && tstzrange(a.start_at,a.end_at,'[)')
      )
    then
      slot_start:=slot at time zone tz;
      return next;
    end if;

    slot:=slot+interval '30 minutes';
  end loop;
end;
$$;

grant execute on function public.get_available_slots(uuid,date) to authenticated;

create or replace function public.create_appointment(p_service_id uuid,p_start_at timestamptz,p_notes text default null)
returns uuid
language plpgsql
security definer
set search_path=''
as $$
declare
  uid uuid:=auth.uid(); bid uuid; price numeric; dur integer; buffer integer; dep_pct numeric; end_at timestamptz; appt uuid;
begin
  select business_id,price,duration_minutes,coalesce(interval_after_minutes,0),deposit_percentage
  into bid,price,dur,buffer,dep_pct
  from public.services where id=p_service_id and active=true;

  if uid is null then raise exception 'Usuário não autenticado.'; end if;
  if p_start_at<=now() then raise exception 'Escolha um horário futuro.'; end if;

  end_at:=p_start_at+make_interval(mins=>dur+buffer);

  if exists(
    select 1 from public.appointments a
    where a.business_id=bid
      and a.status in('pending','confirmed')
      and tstzrange(p_start_at,end_at,'[)') && tstzrange(a.start_at,a.end_at,'[)')
  ) then raise exception 'Horário indisponível.'; end if;

  insert into public.appointments(
    business_id,client_id,service_id,start_at,end_at,total_amount,deposit_amount,remaining_amount,status,payment_status,notes
  )
  values(
    bid,uid,p_service_id,p_start_at,end_at,price,round(price*(dep_pct/100),2),price-round(price*(dep_pct/100),2),'pending','pending',nullif(trim(p_notes),'')
  )
  returning id into appt;

  return appt;
exception when exclusion_violation then
  raise exception 'Horário indisponível.';
end;
$$;

grant execute on function public.create_appointment(uuid,timestamptz,text) to authenticated;

create or replace function public.cancel_own_appointment(p_appointment_id uuid)
returns boolean
language plpgsql
security definer
set search_path=''
as $$
begin
  update public.appointments
  set status='cancelled',updated_at=now()
  where id=p_appointment_id
    and client_id=auth.uid()
    and start_at>now()
    and status in('pending','confirmed');

  if not found then raise exception 'Cancelamento não permitido.'; end if;
  return true;
end;
$$;

grant execute on function public.cancel_own_appointment(uuid) to authenticated;

-- EMPRESA BASE
insert into public.businesses(slug,name)
values('debora-gomes-beauty','Débora Gomes Beauty')
on conflict(slug) do nothing;

-- HORÁRIOS PADRÃO (ajuste depois)
insert into public.business_hours(business_id,weekday,opening_time,closing_time,lunch_start,lunch_end,active)
select b.id,x.weekday,x.opening_time::time,x.closing_time::time,x.lunch_start::time,x.lunch_end::time,x.active
from public.businesses b
cross join (
  values
  (0,null,null,null,null,false),
  (1,'09:00','19:00','12:00','13:00',true),
  (2,'09:00','19:00','12:00','13:00',true),
  (3,'09:00','19:00','12:00','13:00',true),
  (4,'09:00','19:00','12:00','13:00',true),
  (5,'09:00','19:00','12:00','13:00',true),
  (6,'09:00','17:00','12:00','13:00',true)
) x(weekday,opening_time,closing_time,lunch_start,lunch_end,active)
where b.slug='debora-gomes-beauty'
on conflict(business_id,weekday) do nothing;