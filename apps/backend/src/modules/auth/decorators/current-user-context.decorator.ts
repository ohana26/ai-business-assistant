import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { CurrentUserContext as CurrentUserContextData } from '../types/current-user-context.type';

export const CurrentUserContext = createParamDecorator(
  (_: unknown, context: ExecutionContext): CurrentUserContextData => {
    const request = context.switchToHttp().getRequest<{
      currentUserContext: CurrentUserContextData;
    }>();

    return request.currentUserContext;
  },
);
