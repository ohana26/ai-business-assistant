import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from '../constants/rbac.constants';

export const RequireRole = (...roles: string[]) =>
  SetMetadata(ROLES_KEY, roles);
