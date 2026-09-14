-- ============================================================================
-- YADA — Lot L1 : CRM & fiche société
-- Migration 0003 : colonnes CRM (aucune table nouvelle — L1 vit sur le socle).
-- Exécutée par le rôle PROPRIÉTAIRE (yada_owner).
-- ============================================================================

-- entreprises : position dans le pipeline + suivi commercial + trace d'enrichissement.
alter table entreprises
  add column if not exists etape_crm       text not null default 'nouveau'
    check (etape_crm in ('nouveau','qualifie','proposition','gagne','perdu')),
  add column if not exists origine          text,
  add column if not exists collaborateur_id uuid references utilisateurs(id),
  add column if not exists note_crm         text,
  add column if not exists prochaine_action date,
  add column if not exists source_maj_at    timestamptz;

create index if not exists entreprises_etape on entreprises (organisation_id, etape_crm);

-- tiers : rôle de l'interlocuteur + contact référent.
alter table tiers
  add column if not exists fonction  text,
  add column if not exists principal boolean not null default false;
