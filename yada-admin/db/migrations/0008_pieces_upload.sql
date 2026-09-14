-- ============================================================================
-- YADA — Lot 1 (jalons front) : stockage réel des octets d'une pièce déposée.
-- Migration 0008 (additive) : les pièces (documents) peuvent porter leur contenu
-- binaire encodé en base64, servi ensuite par un endpoint de téléchargement.
-- Aucune donnée existante modifiée (colonnes NULLables ajoutées).
-- ============================================================================

alter table documents add column if not exists contenu_base64 text;

-- La RLS de `documents` est déjà posée (migration 0002) : la nouvelle colonne
-- hérite de la même isolation par organisation. Rien d'autre à faire.
