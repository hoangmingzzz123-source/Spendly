-- Bill splitting tables for Spendly
-- This migration creates all tables required by src/app/bill/supabaseApi.ts

create extension if not exists pgcrypto;

create table if not exists public.bills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  "createdDate" timestamptz not null default now(),
  status text not null default 'PENDING',
  "totalAmount" numeric(14, 2) not null default 0,
  constraint bills_status_check check (status in ('PENDING', 'COMPLETED', 'PARTIAL', 'UNPAID'))
);

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  "billId" uuid not null references public.bills(id) on delete cascade,
  name text not null
);

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  "billId" uuid not null references public.bills(id) on delete cascade,
  name text not null,
  price numeric(14, 2) not null,
  constraint items_price_non_negative check (price >= 0)
);

create table if not exists public.itemshares (
  id uuid primary key default gen_random_uuid(),
  "itemId" uuid not null references public.items(id) on delete cascade,
  "participantId" uuid not null references public.participants(id) on delete cascade,
  constraint itemshares_unique_item_participant unique ("itemId", "participantId")
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  "billId" uuid not null references public.bills(id) on delete cascade,
  "participantId" uuid not null references public.participants(id) on delete cascade,
  "amountPaid" numeric(14, 2) not null,
  constraint payments_amount_non_negative check ("amountPaid" >= 0)
);

create table if not exists public.settlements (
  id uuid primary key default gen_random_uuid(),
  "billId" uuid not null references public.bills(id) on delete cascade,
  "fromParticipantId" uuid not null references public.participants(id) on delete cascade,
  "toParticipantId" uuid not null references public.participants(id) on delete cascade,
  amount numeric(14, 2) not null,
  constraint settlements_amount_positive check (amount > 0),
  constraint settlements_from_to_different check ("fromParticipantId" <> "toParticipantId")
);

create table if not exists public.paymenttransactions (
  id uuid primary key default gen_random_uuid(),
  "billId" uuid not null references public.bills(id) on delete cascade,
  "fromParticipantId" uuid not null references public.participants(id) on delete cascade,
  "toParticipantId" uuid not null references public.participants(id) on delete cascade,
  amount numeric(14, 2) not null,
  "paymentDate" timestamptz not null default now(),
  note text,
  "createdAt" timestamptz not null default now(),
  constraint paymenttransactions_amount_positive check (amount > 0),
  constraint paymenttransactions_from_to_different check ("fromParticipantId" <> "toParticipantId")
);

create index if not exists idx_participants_bill_id on public.participants ("billId");
create index if not exists idx_items_bill_id on public.items ("billId");
create index if not exists idx_itemshares_item_id on public.itemshares ("itemId");
create index if not exists idx_itemshares_participant_id on public.itemshares ("participantId");
create index if not exists idx_payments_bill_id on public.payments ("billId");
create index if not exists idx_payments_participant_id on public.payments ("participantId");
create index if not exists idx_settlements_bill_id on public.settlements ("billId");
create index if not exists idx_paymenttransactions_bill_id on public.paymenttransactions ("billId");

comment on table public.bills is 'Main bill records for bill splitting feature';
comment on table public.participants is 'People participating in a bill';
comment on table public.items is 'Items belonging to a bill';
comment on table public.itemshares is 'Mapping of item to participant shares';
comment on table public.payments is 'Recorded payments by participants';
comment on table public.settlements is 'Computed settlement rows between participants';
comment on table public.paymenttransactions is 'Transaction history for bill settlements';
