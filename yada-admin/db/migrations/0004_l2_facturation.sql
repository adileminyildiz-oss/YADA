-- ============================================================================
-- YADA — Lot L2 : Facturation & e-invoicing
-- Migration 0004 : colonnes L2 sur factures/facture_lignes + tables reglements
-- et numerotation (séquence continue par entreprise) + fonction next_numero.
-- ============================================================================

-- factures : origine (avoir/acompte), devise, régime TVA, e-invoice, encaissé.
alter table factures
  add column if not exists facture_origine_id uuid references factures(id),
  add column if not exists devise         char(3) not null default 'EUR',
  add column if not exists regime_tva      text not null default 'normal'
    check (regime_tva in ('normal','franchise','autoliquidation','intracom')),
  add column if not exists plateforme_id   text,
  add column if not exists montant_paye    numeric(14,2) not null default 0;

-- facture_lignes : nature (pilote l'affichage/mentions), remise, compte produit (L4).
alter table facture_lignes
  add column if not exists nature         text not null default 'service'
    check (nature in ('bien','service','prestation')),
  add column if not exists remise_pct     numeric(5,2) not null default 0,
  add column if not exists compte_produit text;

-- reglements : encaissements (partiels/total) → alimentent factures.montant_paye.
create table if not exists reglements (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id),
  entreprise_id   uuid not null references entreprises(id),
  facture_id      uuid not null references factures(id) on delete cascade,
  date_reglement  date not null default current_date,
  montant         numeric(14,2) not null,
  moyen           text not null default 'virement'
    check (moyen in ('virement','cb','cheque','prelevement','especes')),
  created_at      timestamptz not null default now()
);
create index if not exists reglements_facture on reglements (facture_id);

-- numerotation : compteur continu par (organisation, entreprise, préfixe).
-- Préfixes distincts (BR provisoire, FAC, DEV, AV, AC) → la suite FAC reste
-- continue même si un brouillon BR est supprimé.
create table if not exists numerotation (
  organisation_id uuid not null references organisations(id),
  entreprise_id   uuid not null references entreprises(id),
  prefixe         text not null,
  dernier         int  not null default 0,
  primary key (organisation_id, entreprise_id, prefixe)
);

-- RLS sur les nouvelles tables (le rôle applicatif reste cloisonné).
do $$
declare t text;
begin
  foreach t in array array['reglements','numerotation'] loop
    execute format('alter table %I enable row level security;', t);
    execute format('drop policy if exists tenant_isolation on %I;', t);
    execute format(
      'create policy tenant_isolation on %I
         using (organisation_id = current_setting(''app.org'', true)::uuid)
         with check (organisation_id = current_setting(''app.org'', true)::uuid);', t);
  end loop;
end $$;

-- Attribution atomique du prochain numéro (dans la transaction tenant → app.org).
create or replace function next_numero(p_entreprise uuid, p_prefixe text)
returns text language plpgsql as $$
declare v_org uuid := current_setting('app.org', true)::uuid; v_n int;
begin
  insert into numerotation(organisation_id, entreprise_id, prefixe, dernier)
    values (v_org, p_entreprise, p_prefixe, 1)
  on conflict (organisation_id, entreprise_id, prefixe)
    do update set dernier = numerotation.dernier + 1
  returning dernier into v_n;
  return p_prefixe || '-' || to_char(now(),'YYYY') || '-' || lpad(v_n::text, 4, '0');
end $$;

grant execute on function next_numero(uuid, text) to yada_app;
