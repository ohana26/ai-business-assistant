export const RBAC_PERMISSIONS = {
  COMPANY_MANAGE: 'company.manage',
  USER_INVITE: 'user.invite',
  USER_REMOVE: 'user.remove',
  WORKSPACE_MANAGE: 'workspace.manage',
  KNOWLEDGE_UPLOAD: 'knowledge.upload',
  KNOWLEDGE_VIEW: 'knowledge.view',
  ASSISTANT_MANAGE: 'assistant.manage',
  BILLING_MANAGE: 'billing.manage',
  AUDIT_VIEW: 'audit.view',
} as const;

export const RBAC_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  COMPANY_ADMIN: 'COMPANY_ADMIN',
  MANAGER: 'MANAGER',
  USER: 'USER',
  READ_ONLY: 'READ_ONLY',
} as const;

export const PERMISSIONS_KEY = 'required_permissions';
export const ROLES_KEY = 'required_roles';
