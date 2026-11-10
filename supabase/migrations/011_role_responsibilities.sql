-- Align role grants with the revised responsibilities:
-- everyone can author content; moderation and administration remain separate.

DELETE FROM public.user_roles AS old_author
USING public.user_roles AS member_role
WHERE old_author.user_id = member_role.user_id
  AND old_author.role_type = 'author'
  AND member_role.role_type = 'member';

UPDATE public.user_roles
SET role_type = 'member'
WHERE role_type = 'author';

INSERT INTO public.user_roles (tenant_id, user_id, role_type, status)
SELECT users.tenant_id, users.id, 'member', 'active'
FROM public.users AS users
WHERE users.status = 'active'
ON CONFLICT (user_id, role_type) DO NOTHING;

ALTER TABLE public.user_roles
  DROP CONSTRAINT IF EXISTS user_roles_role_type_check;

ALTER TABLE public.user_roles
  ADD CONSTRAINT user_roles_role_type_check
  CHECK (role_type IN (
    'member',
    'seller',
    'distributor',
    'service_provider',
    'moderator',
    'admin',
    'master_admin'
  ));

COMMENT ON COLUMN public.user_roles.role_type IS
  'member | seller | distributor | service_provider | moderator | admin | master_admin';

ALTER TABLE public.security_audit_logs
  DROP CONSTRAINT IF EXISTS security_audit_logs_action_type_check;

ALTER TABLE public.security_audit_logs
  ADD CONSTRAINT security_audit_logs_action_type_check
  CHECK (action_type IN (
    'incident_detected',
    'session_invalidated',
    'account_locked',
    'ip_blocked',
    'admin_mitigated',
    'mfa_breach_attempt',
    'sybil_quarantined',
    'aml_hold_triggered',
    'role_override_used'
  ));

COMMENT ON COLUMN public.security_audit_logs.action_type IS
  'Includes role_override_used for audited Master Admin permission overrides.';
