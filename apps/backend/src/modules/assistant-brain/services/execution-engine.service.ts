import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AuditService } from '../../audit/audit.service';
import type { ToolExecutionPlan } from '../interfaces/tool-execution-plan.interface';
import type { ToolExecutionResult } from '../interfaces/tool-execution-result.interface';
import { ToolRegistryService } from './tool-registry.service';

@Injectable()
export class ExecutionEngineService {
  constructor(
    private readonly toolRegistryService: ToolRegistryService,
    private readonly auditService: AuditService,
  ) {}

  async executePlan(params: {
    plan: ToolExecutionPlan;
    companyId: string;
    userId: string;
    conversationId: string;
    confirmedByUser?: boolean;
  }): Promise<ToolExecutionResult> {
    const executionId = randomUUID();

    await this.auditService.log({
      companyId: params.companyId,
      userId: params.userId,
      action: 'tool.execution.started',
      resourceType: 'assistant.tool_execution',
      resourceId: executionId,
      metadata: {
        conversationId: params.conversationId,
        toolName: params.plan.toolName,
        confidence: params.plan.confidence,
        missingInformation: params.plan.missingInformation,
      },
    });

    if (params.plan.missingInformation.length > 0) {
      const result: ToolExecutionResult = {
        success: false,
        executionId,
        toolName: params.plan.toolName,
        message: `Cannot execute tool because required information is missing: ${params.plan.missingInformation.join(', ')}`,
        errorCode: 'MISSING_INFORMATION',
      };

      await this.logFailed(params, result);
      return result;
    }

    if (params.plan.requiresUserConfirmation && !params.confirmedByUser) {
      const result: ToolExecutionResult = {
        success: false,
        executionId,
        toolName: params.plan.toolName,
        message: 'Tool execution requires user confirmation',
        errorCode: 'CONFIRMATION_REQUIRED',
      };

      await this.logFailed(params, result);
      return result;
    }

    const tool = this.toolRegistryService.resolve(params.plan.toolName);
    if (!tool) {
      const result: ToolExecutionResult = {
        success: false,
        executionId,
        toolName: params.plan.toolName,
        message: `No registered tool found for "${params.plan.toolName}"`,
        errorCode: 'TOOL_NOT_FOUND',
      };

      await this.logFailed(params, result);
      return result;
    }

    try {
      const result = tool.execute(params.plan.parameters, executionId);
      if (!result.success) {
        await this.logFailed(params, result);
        return result;
      }

      await this.auditService.log({
        companyId: params.companyId,
        userId: params.userId,
        action: 'tool.execution.completed',
        resourceType: 'assistant.tool_execution',
        resourceId: executionId,
        metadata: {
          conversationId: params.conversationId,
          toolName: params.plan.toolName,
          result: result.data ?? null,
        },
      });
      return result;
    } catch (error) {
      const result: ToolExecutionResult = {
        success: false,
        executionId,
        toolName: params.plan.toolName,
        message:
          error instanceof Error
            ? error.message
            : 'Unexpected tool execution failure',
        errorCode: 'EXECUTION_ERROR',
      };
      await this.logFailed(params, result);
      return result;
    }
  }

  private async logFailed(
    params: {
      plan: ToolExecutionPlan;
      companyId: string;
      userId: string;
      conversationId: string;
    },
    result: ToolExecutionResult,
  ) {
    await this.auditService.log({
      companyId: params.companyId,
      userId: params.userId,
      action: 'tool.execution.failed',
      resourceType: 'assistant.tool_execution',
      resourceId: result.executionId,
      metadata: {
        conversationId: params.conversationId,
        toolName: params.plan.toolName,
        message: result.message,
        errorCode: result.errorCode ?? null,
      },
    });
  }
}
