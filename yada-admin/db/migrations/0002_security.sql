-- ============================================================================
-- YADA CORE — sécurité & isolation multi-tenant — Lot L0
-- Migration 0002 : rôle applicatif, Row-Level Security, fonctions d'amorçage.
-- Exécutée par le rôle PROPRIÉTAIRE (yada_owner).
-- ============================================================================

-- Rôle applicatif : NON superuser → réellement soumis au RLS.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'yada_app') then
    create role yada_app login password 'yada_app_pwd';
  end if;
end $$;

grant usage on schema public to yada_app;
grant select, insert, update, delete on all tables in schema public to yada_app;
grant usage, select on all sequences in schema public to yada_app;
alter default privileges in schema public grant select, insert, update, delete on tables to yada_app;
alter default privileges in schema public grant usage, select on sequences to yada_app;

-- ── Row-Level Security : chaque ligne n'est visible que pour son organisation ──
-- L'application pose `set_config('app.org', <organisation_id>, true)` par requête.
do $$
declare t text;
begin
  foreach t in array array[
    'organisations','utilisateurs','entreprises','tiers','missions',
    'documents','formalites','factures','facture_lignes','signatures','audit_log'
  ] loop
    -- RLS activé, sans FORCE : le rôle propriétaire (migrations + fonctions
    -- SECURITY DEFINER d'amorçage) le contourne ; le rôle applicatif yada_app,
    -- distinct, y reste soumis → isolation réelle des tenants.
    execute format('alter table %I enable row level security;', t);
    execute format('drop policy if exists tenant_isolation on %I;', t);
  end loop;
end $$;

-- organisations : la ligne dont l'id == app.org
create policy tenant_isolation on organisations
  using (id = current_setting('app.org', true)::uuid)
  with check (id = current_setting('app.org', true)::uuid);

-- toutes les autres tables : colonne organisation_id == app.org
do $$
declare t text;
begin
  foreach t in array array[
    'utilisateurs','entreprises','tiers','missions',
    'documents','formalites','factures','facture_lignes','signatures','audit_log'
  ] loop
    execute format(
      'create policy tenant_isolation on %I
         using (organisation_id = current_setting(''app.org'', true)::uuid)
         with check (organisation_id = current_setting(''app.org'', true)::uuid);', t);
  end loop;
end $$;

-- ── Fonctions d'amorçage (SECURITY DEFINER : exécutées comme yada_owner) ──
-- Elles contournent légitimement le RLS pour les opérations sans contexte de tenant :
-- créer une organisation, et retrouver un utilisateur au login.

-- Inscription : crée l'organisation (cabinet) + son premier administrateur.
create or replace function yada_register(
  p_org_nom text, p_email citext, p_hash text, p_nom text, p_prenom text
) returns table(org_id uuid, user_id uuid)
language plpgsql security definer set search_path = public as $$
declare v_org uuid; v_user uuid;
begin
  insert into organisations(nom, type) values (p_org_nom, 'cabinet') returning id into v_org;
  insert into utilisateurs(organisation_id, email, nom, prenom, role, mot_de_passe_hash)
    values (v_org, p_email, p_nom, p_prenom, 'admin', p_hash) returning id into v_user;
  insert into audit_log(organisation_id, utilisateur_id, entite, entite_id, action, details)
    values (v_org, v_user, 'organisations', v_org, 'creation', jsonb_build_object('via','register'));
  org_id := v_org; user_id := v_user; return next;
end $$;

-- Login : retrouve un utilisateur par e-mail (unicité globale L0), sans contexte tenant.
create or replace function yada_login_lookup(p_email citext)
returns table(user_id uuid, organisation_id uuid, role text, mot_de_passe_hash text,
              actif boolean, nom text, prenom text)
language sql security definer set search_path = public as $$
  select id, organisation_id, role, mot_de_passe_hash, actif, nom, prenom
    from utilisateurs where email = p_email and deleted_at is null limit 1;
$$;

-- Horodatage de connexion (dans le contexte de l'org, appelé après login).
create or replace function yada_touch_login(p_user uuid)
returns void language sql security definer set search_path = public as $$
  update utilisateurs set derniere_connexion = now() where id = p_user;
$$;

revoke all on function yada_register(text, citext, text, text, text) from public;
revoke all on function yada_login_lookup(citext) from public;
revoke all on function yada_touch_login(uuid) from public;
grant execute on function yada_register(text, citext, text, text, text) to yada_app;
grant execute on function yada_login_lookup(citext) to yada_app;
grant execute on function yada_touch_login(uuid) to yada_app;
