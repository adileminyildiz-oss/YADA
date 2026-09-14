-- ============================================================================
-- YADA — Lot L4 : Comptabilité (le moteur)
-- Migration 0006 : chaîne exercices→comptes→journaux→ecritures→lignes→pieces.
-- L'INVARIANT (Σ débit = Σ crédit par écriture) est garanti par la BASE
-- (contrainte différée) : aucune écriture déséquilibrée ne peut être validée.
-- ============================================================================

create table if not exists exercices (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id),
  entreprise_id   uuid not null references entreprises(id),
  date_debut      date not null,
  date_fin        date not null,
  statut          text not null default 'ouvert' check (statut in ('ouvert','cloture')),
  created_at      timestamptz not null default now(),
  unique (organisation_id, entreprise_id, date_debut)
);
create index if not exists exercices_org_ent on exercices (organisation_id, entreprise_id);

create table if not exists comptes (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id),
  entreprise_id   uuid not null references entreprises(id),
  numero          char(9) not null,
  libelle         text not null,
  classe          int not null,
  lettrable       boolean not null default false,
  tiers_id        uuid references tiers(id),
  created_at      timestamptz not null default now(),
  unique (organisation_id, entreprise_id, numero)
);
create index if not exists comptes_org_ent on comptes (organisation_id, entreprise_id);

create table if not exists journaux (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id),
  entreprise_id   uuid not null references entreprises(id),
  code            text not null,
  libelle         text not null,
  type            text not null check (type in ('achat','vente','banque','od')),
  unique (organisation_id, entreprise_id, code)
);

create table if not exists ecritures (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id),
  entreprise_id   uuid not null references entreprises(id),
  exercice_id     uuid not null references exercices(id),
  journal_id      uuid not null references journaux(id),
  date            date not null,
  numero_piece    text,
  libelle         text not null,
  facture_id      uuid references factures(id),
  reception_id    uuid references receptions(id),
  verrouillee     boolean not null default false,
  created_at      timestamptz not null default now()
);
create index if not exists ecritures_org_ent on ecritures (organisation_id, entreprise_id, date);

create table if not exists ecriture_lignes (
  id             uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id),
  ecriture_id    uuid not null references ecritures(id) on delete cascade,
  compte_numero  char(9) not null,
  libelle        text,
  debit          numeric(14,2) not null default 0,
  credit         numeric(14,2) not null default 0,
  lettre         text,
  rapproche      boolean not null default false,
  check (debit >= 0 and credit >= 0 and not (debit > 0 and credit > 0))
);
create index if not exists ecriture_lignes_ecr on ecriture_lignes (ecriture_id);
create index if not exists ecriture_lignes_compte on ecriture_lignes (organisation_id, compte_numero);

create table if not exists pieces_liees (
  id             uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id),
  ecriture_id    uuid not null references ecritures(id) on delete cascade,
  document_id    uuid not null references documents(id),
  unique (ecriture_id, document_id)
);

-- ── RLS ──
do $$
declare t text;
begin
  foreach t in array array['exercices','comptes','journaux','ecritures','ecriture_lignes','pieces_liees'] loop
    execute format('alter table %I enable row level security;', t);
    execute format('drop policy if exists tenant_isolation on %I;', t);
    execute format(
      'create policy tenant_isolation on %I
         using (organisation_id = current_setting(''app.org'', true)::uuid)
         with check (organisation_id = current_setting(''app.org'', true)::uuid);', t);
  end loop;
end $$;

-- ── L'INVARIANT COMPTABLE, garanti par la base (contrainte différée) ──
create or replace function trg_ecriture_equilibre() returns trigger
language plpgsql as $$
declare v_ecr uuid; v_n int; v_d numeric; v_c numeric;
begin
  v_ecr := coalesce(NEW.ecriture_id, OLD.ecriture_id);
  -- écriture supprimée entièrement (cascade) → plus rien à vérifier
  if not exists (select 1 from ecritures where id = v_ecr) then return null; end if;
  select count(*), coalesce(sum(debit),0), coalesce(sum(credit),0)
    into v_n, v_d, v_c from ecriture_lignes where ecriture_id = v_ecr;
  if v_n = 0 then
    raise exception 'Écriture % sans ligne', v_ecr using errcode = 'check_violation';
  end if;
  if abs(v_d - v_c) > 0.005 then
    raise exception 'Écriture % déséquilibrée : débit=% crédit=% (Σ débit doit égaler Σ crédit)', v_ecr, v_d, v_c
      using errcode = 'check_violation';
  end if;
  return null;
end $$;

drop trigger if exists ecriture_equilibre on ecriture_lignes;
create constraint trigger ecriture_equilibre
  after insert or update or delete on ecriture_lignes
  deferrable initially deferred
  for each row execute function trg_ecriture_equilibre();
