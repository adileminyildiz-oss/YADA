-- ============================================================================
-- YADA — Lot L5 : Fiscalité, pilotage & assistant IA
-- Migration 0007 : 2 tables seulement (declarations, ia_suggestions).
-- Le reste (KPI, soldes fiscaux) est CALCULÉ à la volée sur les écritures L4.
-- ============================================================================

create table if not exists declarations (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id),
  entreprise_id   uuid not null references entreprises(id),
  type            text not null check (type in ('tva','is','ir','cvae','cfe','liasse')),
  periode         text not null,
  date_echeance   date,
  statut          text not null default 'planifiee' check (statut in ('planifiee','a_faire','deposee')),
  montant         numeric(14,2),
  donnees         jsonb not null default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists declarations_org_ent on declarations (organisation_id, entreprise_id);

create table if not exists ia_suggestions (
  id                 uuid primary key default gen_random_uuid(),
  organisation_id    uuid not null references organisations(id),
  entreprise_id      uuid not null references entreprises(id),
  type               text not null check (type in ('imputation','anomalie','reponse')),
  source_document_id uuid references documents(id),
  source_reception_id uuid references receptions(id),
  proposition        jsonb not null default '{}',
  justification      text,
  confiance          numeric(4,3),
  statut             text not null default 'en_attente'
    check (statut in ('en_attente','acceptee','corrigee','refusee')),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists ia_suggestions_org_ent on ia_suggestions (organisation_id, entreprise_id, statut);

do $$
declare t text;
begin
  foreach t in array array['declarations','ia_suggestions'] loop
    execute format('alter table %I enable row level security;', t);
    execute format('drop policy if exists tenant_isolation on %I;', t);
    execute format(
      'create policy tenant_isolation on %I
         using (organisation_id = current_setting(''app.org'', true)::uuid)
         with check (organisation_id = current_setting(''app.org'', true)::uuid);', t);
  end loop;
  if not exists (select 1 from pg_trigger where tgname = 'trg_declarations_updated') then
    create trigger trg_declarations_updated before update on declarations
      for each row execute function set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'trg_ia_suggestions_updated') then
    create trigger trg_ia_suggestions_updated before update on ia_suggestions
      for each row execute function set_updated_at();
  end if;
end $$;
