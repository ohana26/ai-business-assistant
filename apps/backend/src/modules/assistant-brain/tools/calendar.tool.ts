import { Injectable } from '@nestjs/common';
import type { Tool } from '../interfaces/tool.interface';
import type { ToolExecutionPlan } from '../interfaces/tool-execution-plan.interface';
import type { ToolExecutionResult } from '../interfaces/tool-execution-result.interface';

@Injectable()
export class CalendarTool implements Tool {
  name() {
    return 'calendar.create_event';
  }

  description() {
    return 'Creates a calendar event (placeholder implementation)';
  }

  schema() {
    return {
      type: 'object' as const,
      properties: {
        title: {
          type: 'string' as const,
          description: 'Event title',
          required: true,
        },
        start: {
          type: 'string' as const,
          description: 'Event start timestamp in ISO-like format',
          required: true,
        },
        durationMinutes: {
          type: 'number' as const,
          description: 'Event duration in minutes',
          required: true,
        },
      },
    };
  }

  execute(
    parameters: ToolExecutionPlan['parameters'],
    executionId: string,
  ): ToolExecutionResult {
    const title = parameters.title;
    const start = parameters.start;
    const durationMinutes = parameters.durationMinutes;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return {
        success: false,
        executionId,
        toolName: this.name(),
        message: 'Calendar event title is required',
        errorCode: 'VALIDATION_ERROR',
      };
    }
    if (
      !start ||
      typeof start !== 'string' ||
      Number.isNaN(Date.parse(start))
    ) {
      return {
        success: false,
        executionId,
        toolName: this.name(),
        message: 'Calendar event start must be a valid date/time string',
        errorCode: 'VALIDATION_ERROR',
      };
    }
    if (
      typeof durationMinutes !== 'number' ||
      !Number.isFinite(durationMinutes) ||
      durationMinutes <= 0
    ) {
      return {
        success: false,
        executionId,
        toolName: this.name(),
        message: 'Calendar event durationMinutes must be a positive number',
        errorCode: 'VALIDATION_ERROR',
      };
    }

    return {
      success: true,
      executionId,
      toolName: this.name(),
      message: 'Mock calendar event created successfully',
      data: {
        status: 'mock_success',
        eventId: `mock_evt_${Date.now()}`,
        title: title.trim(),
        start,
        durationMinutes,
      },
    };
  }
}
