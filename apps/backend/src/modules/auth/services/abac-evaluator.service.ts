import { Injectable } from '@nestjs/common';
import type { AttributeRequirement } from '../types/attribute-requirement.type';

@Injectable()
export class AbacEvaluatorService {
  matches(
    attributes: Record<string, string>,
    requirements: AttributeRequirement[],
  ): boolean {
    if (requirements.length === 0) {
      return true;
    }

    return requirements.every((requirement) => {
      const operator = requirement.operator ?? 'eq';
      const currentValue = attributes[requirement.key];

      if (operator === 'eq') {
        return currentValue === requirement.value;
      }

      return false;
    });
  }
}
