-- ============================================================================
-- YADA CORE — socle relationnel (PostgreSQL 16) — Lot L0
-- Migration 0001 : extensions, 11 tables de fondation, triggers, index.
-- Exécutée par le rôle PROPRIÉTAIRE (yada_owner).
-- ============================================================================

create extension if not exists pgcrypto;   -- gen_random_uuid()
create extension if not exists citext;     -- e-mails insensibles à la casse

-- 1 · organisations (le tenant)
create table if not exists organisations (
  id            uuid primary key default gen_random_uuid(),
  nom           text not null,
  type          text not null default 'cabinet' check (type in ('cabinet','entreprise')),
  siren         char(9),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

-- 2 · utilisateurs
create table if not exists utilisateurs (
  id                 uuid primary key default gen_random_uuid(),
  organisation_id    uuid not null references organisations(id),
  email              citext not null,
  nom                text,
  prenom             text,
  role               text not null default 'collaborateur'
                       check (role in ('admin','collaborateur','client')),
  mot_de_passe_hash  text not null,
  actif              boolean not null default true,
  derniere_connexion timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  deleted_at         timestamptz,
  unique (organisation_id, email)
);
-- L0 : login par e-mail → unicité globale (une même adresse = un seul compte).
create unique index if not exists utilisateurs_email_global on utilisateurs (email) where deleted_at is null;

-- 3 · entreprises (dossiers gérés — le « ENTREPRISE_ID »)
create table if not exists entreprises (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id),
  denomination    text not null,
  forme_juridique text,
  siren           char(9),
  siret           char(14),
  code_ape        text,
  tva_intra       text,
  rcs_ville       text,
  capital         numeric(14,2),
  adresse         text,
  code_postal     text,
  ville           text,
  pays            text default 'France',
  date_creation   date,
  statut          text not null default 'prospect' check (statut in ('prospect','actif','clos')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);
create index if not exists entreprises_org on entreprises (organisation_id);
create index if not exists entreprises_siren on entreprises (siren);

-- 4 · tiers
create table if not exists tiers (
  id                uuid primary key default gen_random_uuid(),
  organisation_id   uuid not null references organisations(id),
  entreprise_id     uuid not null references entreprises(id),
  type              text not null check (type in ('client','fournisseur','prospect')),
  nom               text not null,
  siret             char(14),
  tva_intra         text,
  email             citext,
  telephone         text,
  adresse           text,
  code_postal       text,
  ville             text,
  iban              text,
  compte_auxiliaire text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  deleted_at        timestamptz
);
create index if not exists tiers_org_ent on tiers (organisation_id, entreprise_id);

-- 5 · missions
create table if not exists missions (
  id               uuid primary key default gen_random_uuid(),
  organisation_id  uuid not null references organisations(id),
  entreprise_id    uuid not null references entreprises(id),
  type             text not null check (type in ('formalite','comptabilite','juridique','fiscal','social','conseil')),
  libelle          text not null,
  statut           text not null default 'ouverte' check (statut in ('ouverte','en_cours','en_attente','cloturee')),
  collaborateur_id uuid references utilisateurs(id),
  budget           numeric(14,2),
  date_debut       date,
  date_echeance    date,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  deleted_at       timestamptz
);
create index if not exists missions_org_ent on missions (organisation_id, entreprise_id);

-- 6 · documents (GED)
create table if not exists documents (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id),
  entreprise_id   uuid references entreprises(id),
  mission_id      uuid references missions(id),
  categorie       text not null default 'autre' check (categorie in ('statuts','kbis','identite','facture','contrat','releve','autre')),
  nom_fichier     text not null,
  chemin_stockage text not null,
  mime            text,
  taille_octets   bigint,
  texte_ocr       text,
  version         int not null default 1,
  hash_sha256     text,
  created_by      uuid references utilisateurs(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);
create index if not exists documents_org_ent on documents (organisation_id, entreprise_id);
create index if not exists documents_ocr on documents using gin (to_tsvector('french', coalesce(texte_ocr,'')));

-- 7 · formalites
create table if not exists formalites (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id),
  entreprise_id   uuid references entreprises(id),
  mission_id      uuid references missions(id),
  type            text not null check (type in ('creation','modification','dissolution')),
  sous_type       text,
  statut          text not null default 'brouillon' check (statut in ('brouillon','en_attente','verification','validee','transmise')),
  donnees         jsonb not null default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);
create index if not exists formalites_org_ent on formalites (organisation_id, entreprise_id);

-- 8 · factures
create table if not exists factures (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id),
  entreprise_id   uuid not null references entreprises(id),
  tiers_id        uuid references tiers(id),
  type            text not null default 'facture' check (type in ('devis','facture','avoir','acompte')),
  numero          text not null,
  date_emission   date not null,
  date_echeance   date,
  statut          text not null default 'brouillon' check (statut in ('brouillon','emise','envoyee','payee','partielle','annulee')),
  montant_ht      numeric(14,2) not null default 0,
  montant_tva     numeric(14,2) not null default 0,
  montant_ttc     numeric(14,2) not null default 0,
  conditions      text,
  facturx_statut  text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz,
  unique (organisation_id, entreprise_id, numero)
);
create index if not exists factures_org_ent on factures (organisation_id, entreprise_id);

-- 9 · facture_lignes
create table if not exists facture_lignes (
  id               uuid primary key default gen_random_uuid(),
  organisation_id  uuid not null references organisations(id),
  facture_id       uuid not null references factures(id) on delete cascade,
  designation      text not null,
  quantite         numeric(12,3) not null default 1,
  prix_unitaire_ht numeric(14,2) not null default 0,
  taux_tva         numeric(5,2) not null default 20,
  ordre            int not null default 0
);
create index if not exists facture_lignes_fac on facture_lignes (facture_id);

-- 10 · signatures
create table if not exists signatures (
  id               uuid primary key default gen_random_uuid(),
  organisation_id  uuid not null references organisations(id),
  document_id      uuid not null references documents(id),
  signataire_email citext not null,
  niveau           text not null default 'simple' check (niveau in ('simple','avancee')),
  statut           text not null default 'en_attente' check (statut in ('en_attente','signee','refusee','expiree')),
  prestataire_ref  text,
  horodatage       timestamptz,
  created_at       timestamptz not null default now()
);
create index if not exists signatures_org_doc on signatures (organisation_id, document_id);

-- 11 · audit_log (append-only)
create table if not exists audit_log (
  id              bigserial primary key,
  organisation_id uuid not null,
  utilisateur_id  uuid,
  entite          text not null,
  entite_id       uuid,
  action          text not null check (action in ('creation','modification','suppression','consultation','connexion')),
  details         jsonb,
  horodatage      timestamptz not null default now()
);
create index if not exists audit_org on audit_log (organisation_id, entite, entite_id);

-- updated_at automatique
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare t text;
begin
  foreach t in array array[
    'organisations','utilisateurs','entreprises','tiers','missions',
    'documents','formalites','factures'
  ] loop
    if not exists (select 1 from pg_trigger where tgname = format('trg_%s_updated', t)) then
      execute format(
        'create trigger trg_%1$s_updated before update on %1$s
         for each row execute function set_updated_at();', t);
    end if;
  end loop;
end $$;
