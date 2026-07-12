import { SetMetadata } from '@nestjs/common';
import { PERMISSIONS_KEY } from '../../auth/constants/rbac.constants';

export const RequirePermission = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
