import { SetMetadata } from '@nestjs/common';
import { ATTRIBUTE_REQUIREMENTS_KEY } from '../constants/abac.constants';
import type { AttributeRequirement } from '../types/attribute-requirement.type';

export const RequireAttributes = (...requirements: AttributeRequirement[]) =>
  SetMetadata(ATTRIBUTE_REQUIREMENTS_KEY, requirements);
