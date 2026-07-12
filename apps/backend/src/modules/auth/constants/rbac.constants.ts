export const RBAC_PERMISSIONS = {
  COMPANY_MANAGE: 'company.manage',
  USER_INVITE: 'user.invite',
  USER_REMOVE: 'user.remove',
  USER_UPDATE: 'user.update',
  WORKSPACE_CREATE: 'workspace.create',
  WORKSPACE_UPDATE: 'workspace.update',
  WORKSPACE_DELETE: 'workspace.delete',
  KNOWLEDGE_UPLOAD: 'knowledge.upload',
  KNOWLEDGE_VIEW: 'knowledge.view',
  KNOWLEDGE_DELETE: 'knowledge.delete',
  ASSISTANT_CREATE: 'assistant.create',
  ASSISTANT_MANAGE: 'assistant.manage',
  ASSISTANT_CHAT: 'assistant.chat',
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
