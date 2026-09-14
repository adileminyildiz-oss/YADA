-- ============================================================================
-- YADA — Lot L3 : GED, OCR & réception fournisseurs
-- Migration 0005 : colonnes GED sur documents + tables receptions et fiches_tiers.
-- ============================================================================

-- documents (au socle) : canal d'entrée + score de lecture.
alter table documents
  add column if not exists canal        text not null default 'manuel'
    check (canal in ('manuel','email','client','plateforme')),
  add column if not exists confiance_ocr numeric(4,3);

-- receptions : la bannette de traitement (une pièce en cours).
create table if not exists receptions (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id),
  entreprise_id   uuid not null references entreprises(id),
  document_id     uuid references documents(id),
  sens            text not null default 'achat' check (sens in ('achat','vente')),
  statut          text not null default 'recue'
    check (statut in ('recue','lue','a_valider','comptabilisee','refusee')),
  doublon_de      uuid references receptions(id),
  tiers_id        uuid references tiers(id),
  numero          text,
  date_facture    date,
  montant_ht      numeric(14,2),
  montant_tva     numeric(14,2),
  montant_ttc     numeric(14,2),
  confiance       numeric(4,3),
  donnees_lues    jsonb not null default '{}',
  facture_id      uuid references factures(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists receptions_org_ent on receptions (organisation_id, entreprise_id);
create index if not exists receptions_statut on receptions (organisation_id, statut);

-- fiches_tiers : fournisseur/client inconnu à créer (rattache plusieurs receptions).
create table if not exists fiches_tiers (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id),
  entreprise_id   uuid not null references entreprises(id),
  type            text not null default 'fournisseur' check (type in ('fournisseur','client')),
  statut          text not null default 'a_remplir' check (statut in ('a_remplir','remplie','validee')),
  raison          text,
  siret           char(14),
  tva_intra       text,
  email           citext,
  telephone       text,
  iban            text,
  reception_ids   uuid[] not null default '{}',
  tiers_id        uuid references tiers(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists fiches_tiers_org_ent on fiches_tiers (organisation_id, entreprise_id);

-- RLS sur les nouvelles tables.
do $$
declare t text;
begin
  foreach t in array array['receptions','fiches_tiers'] loop
    execute format('alter table %I enable row level security;', t);
    execute format('drop policy if exists tenant_isolation on %I;', t);
    execute format(
      'create policy tenant_isolation on %I
         using (organisation_id = current_setting(''app.org'', true)::uuid)
         with check (organisation_id = current_setting(''app.org'', true)::uuid);', t);
  end loop;
end $$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'trg_receptions_updated') then
    create trigger trg_receptions_updated before update on receptions
      for each row execute function set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'trg_fiches_tiers_updated') then
    create trigger trg_fiches_tiers_updated before update on fiches_tiers
      for each row execute function set_updated_at();
  end if;
end $$;
