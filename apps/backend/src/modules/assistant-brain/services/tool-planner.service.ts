import { Injectable } from '@nestjs/common';
import type { ToolExecutionPlan } from '../interfaces/tool-execution-plan.interface';

@Injectable()
export class ToolPlannerService {
  buildPlan(params: { message: string }): ToolExecutionPlan {
    const message = params.message.trim();
    const normalized = message.toLowerCase();

    if (
      this.matches(normalized, ['meeting', 'calendar', 'schedule', 'event'])
    ) {
      return this.planCalendarEvent(message, normalized);
    }

    if (
      this.matches(normalized, ['cancel', 'delete', 'remove']) &&
      this.matches(normalized, ['meeting', 'event'])
    ) {
      return {
        toolName: 'calendar.delete_event',
        reason: 'User asked to cancel or delete a calendar event',
        confidence: 0.9,
        parameters: {},
        missingInformation: ['event identifier or exact date/time'],
        requiresUserConfirmation: true,
      };
    }

    if (this.matches(normalized, ['send', 'email', 'mail'])) {
      return {
        toolName: 'gmail.send_email',
        reason: 'User requested sending an email',
        confidence: 0.88,
        parameters: {},
        missingInformation: ['recipient', 'subject', 'body'],
        requiresUserConfirmation: true,
      };
    }

    if (
      this.matches(normalized, ['read', 'check']) &&
      this.matches(normalized, ['email', 'mail', 'inbox'])
    ) {
      return {
        toolName: 'gmail.read_email',
        reason: 'User asked to read inbox/email messages',
        confidence: 0.86,
        parameters: {},
        missingInformation: ['mailbox scope or filter'],
        requiresUserConfirmation: false,
      };
    }

    if (this.matches(normalized, ['invoice', 'invoices', 'unpaid', 'due'])) {
      return {
        toolName: 'erp.get_invoice',
        reason: 'User asked for invoice lookup or unpaid invoice status',
        confidence: 0.85,
        parameters: {
          status: this.matches(normalized, ['unpaid', 'due'])
            ? 'unpaid'
            : 'all',
        },
        missingInformation: [],
        requiresUserConfirmation: false,
      };
    }

    if (this.matches(normalized, ['customer', 'client', 'account'])) {
      return {
        toolName: 'crm.search_customer',
        reason: 'User requested customer/account lookup',
        confidence: 0.8,
        parameters: {},
        missingInformation: ['customer name or identifier'],
        requiresUserConfirmation: false,
      };
    }

    if (this.matches(normalized, ['search the web', 'web search', 'google'])) {
      return {
        toolName: 'web.search',
        reason: 'User requested external web search',
        confidence: 0.8,
        parameters: {},
        missingInformation: ['search query'],
        requiresUserConfirmation: false,
      };
    }

    if (this.matches(normalized, ['api', 'endpoint', 'http'])) {
      return {
        toolName: 'http.request',
        reason: 'User requested external API/HTTP operation',
        confidence: 0.78,
        parameters: {},
        missingInformation: ['method', 'url'],
        requiresUserConfirmation: true,
      };
    }

    if (this.matches(normalized, ['database', 'sql', 'query'])) {
      return {
        toolName: 'database.query',
        reason: 'User requested database query execution',
        confidence: 0.78,
        parameters: {},
        missingInformation: ['query intent or filter'],
        requiresUserConfirmation: true,
      };
    }

    return {
      toolName: 'http.request',
      reason: 'Action intent detected but specific tool could not be inferred',
      confidence: 0.45,
      parameters: {},
      missingInformation: ['target system', 'action details'],
      requiresUserConfirmation: true,
    };
  }

  private planCalendarEvent(
    message: string,
    normalized: string,
  ): ToolExecutionPlan {
    const parameters: Record<string, string | number | boolean | null> = {};
    const missingInformation: string[] = [];

    if (normalized.includes('tomorrow')) {
      parameters.start = this.tomorrowAtDefaultHourIso();
    } else {
      missingInformation.push('start date/time');
    }

    const explicitDuration = normalized.match(
      /(\d+)\s*(minute|minutes|min|hour|hours)/,
    );
    if (explicitDuration) {
      const amount = Number(explicitDuration[1]);
      const unit = explicitDuration[2];
      parameters.durationMinutes = unit.startsWith('hour')
        ? amount * 60
        : amount;
    } else {
      parameters.durationMinutes = 60;
    }

    const titleMatch = message.match(/["“](.+?)["”]/);
    if (titleMatch?.[1]) {
      parameters.title = titleMatch[1];
    } else {
      missingInformation.push('title');
    }

    return {
      toolName: 'calendar.create_event',
      reason: 'User requested creating or scheduling a meeting/event',
      confidence: missingInformation.length === 0 ? 0.96 : 0.86,
      parameters,
      missingInformation,
      requiresUserConfirmation: false,
    };
  }

  private tomorrowAtDefaultHourIso() {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(10, 0, 0, 0);
    return date.toISOString().slice(0, 16);
  }

  private matches(input: string, keywords: string[]) {
    return keywords.some((keyword) => input.includes(keyword));
  }
}
