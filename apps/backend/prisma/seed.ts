import { PrismaClient } from '@prisma/client';
import {
  RBAC_PERMISSIONS,
  RBAC_ROLES,
} from '../src/modules/auth/constants/rbac.constants';

const prisma = new PrismaClient();

const permissions = [
  RBAC_PERMISSIONS.COMPANY_MANAGE,
  RBAC_PERMISSIONS.USER_INVITE,
  RBAC_PERMISSIONS.USER_REMOVE,
  RBAC_PERMISSIONS.WORKSPACE_MANAGE,
  RBAC_PERMISSIONS.KNOWLEDGE_UPLOAD,
  RBAC_PERMISSIONS.KNOWLEDGE_VIEW,
  RBAC_PERMISSIONS.ASSISTANT_MANAGE,
  RBAC_PERMISSIONS.BILLING_MANAGE,
  RBAC_PERMISSIONS.AUDIT_VIEW,
];

const rolePermissionMap: Record<string, string[]> = {
  [RBAC_ROLES.SUPER_ADMIN]: [...permissions],
  [RBAC_ROLES.COMPANY_ADMIN]: [
    RBAC_PERMISSIONS.COMPANY_MANAGE,
    RBAC_PERMISSIONS.USER_INVITE,
    RBAC_PERMISSIONS.USER_REMOVE,
    RBAC_PERMISSIONS.WORKSPACE_MANAGE,
    RBAC_PERMISSIONS.KNOWLEDGE_UPLOAD,
    RBAC_PERMISSIONS.KNOWLEDGE_VIEW,
    RBAC_PERMISSIONS.ASSISTANT_MANAGE,
    RBAC_PERMISSIONS.BILLING_MANAGE,
    RBAC_PERMISSIONS.AUDIT_VIEW,
  ],
  [RBAC_ROLES.MANAGER]: [
    RBAC_PERMISSIONS.USER_INVITE,
    RBAC_PERMISSIONS.WORKSPACE_MANAGE,
    RBAC_PERMISSIONS.KNOWLEDGE_UPLOAD,
    RBAC_PERMISSIONS.KNOWLEDGE_VIEW,
    RBAC_PERMISSIONS.ASSISTANT_MANAGE,
    RBAC_PERMISSIONS.AUDIT_VIEW,
  ],
  [RBAC_ROLES.USER]: [
    RBAC_PERMISSIONS.KNOWLEDGE_UPLOAD,
    RBAC_PERMISSIONS.KNOWLEDGE_VIEW,
  ],
  [RBAC_ROLES.READ_ONLY]: [RBAC_PERMISSIONS.KNOWLEDGE_VIEW],
};

async function seedPermissions() {
  for (const permissionKey of permissions) {
    await prisma.permission.upsert({
      where: { key: permissionKey },
      update: {},
      create: {
        key: permissionKey,
        description: permissionKey,
      },
    });
  }
}

async function seedRoles() {
  for (const [roleName, permissionKeys] of Object.entries(rolePermissionMap)) {
    const existingRole = await prisma.role.findFirst({
      where: {
        name: roleName,
        companyId: null,
        isSystemRole: true,
        deletedAt: null,
      },
      select: { id: true },
    });

    const role =
      existingRole ??
      (await prisma.role.create({
        data: {
          name: roleName,
          description: `${roleName} default role`,
          isSystemRole: true,
        },
        select: { id: true },
      }));

    const permissionRows = await prisma.permission.findMany({
      where: { key: { in: permissionKeys } },
      select: { id: true, key: true },
    });

    await prisma.rolePermission.deleteMany({
      where: { roleId: role.id },
    });

    await prisma.rolePermission.createMany({
      data: permissionRows.map((permission) => ({
        roleId: role.id,
        permissionId: permission.id,
      })),
      skipDuplicates: true,
    });
  }
}

async function main() {
  await seedPermissions();
  await seedRoles();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('RBAC seed failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
