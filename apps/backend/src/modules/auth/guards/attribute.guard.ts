import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ATTRIBUTE_REQUIREMENTS_KEY } from '../constants/abac.constants';
import { AbacEvaluatorService } from '../services/abac-evaluator.service';
import type { CurrentUserContext } from '../types/current-user-context.type';
import type { AttributeRequirement } from '../types/attribute-requirement.type';

@Injectable()
export class AttributeGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly abacEvaluatorService: AbacEvaluatorService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requirements = this.reflector.getAllAndOverride<
      AttributeRequirement[]
    >(ATTRIBUTE_REQUIREMENTS_KEY, [context.getHandler(), context.getClass()]);

    if (!requirements || requirements.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      currentUserContext?: CurrentUserContext;
    }>();
    const userContext = request.currentUserContext;

    if (!userContext) {
      throw new ForbiddenException('Missing user context');
    }

    const isAllowed = this.abacEvaluatorService.matches(
      userContext.attributes,
      requirements,
    );
    if (!isAllowed) {
      throw new ForbiddenException('Missing required user attributes');
    }

    return true;
  }
}
