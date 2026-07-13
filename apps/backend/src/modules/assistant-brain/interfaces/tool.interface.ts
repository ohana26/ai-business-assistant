import type { ToolExecutionPlan } from './tool-execution-plan.interface';
import type { ToolExecutionResult } from './tool-execution-result.interface';

export interface ToolSchemaProperty {
  type: 'string' | 'number' | 'boolean';
  description: string;
  required: boolean;
}

export interface ToolSchema {
  type: 'object';
  properties: Record<string, ToolSchemaProperty>;
}

export interface Tool {
  name(): string;
  description(): string;
  schema(): ToolSchema;
  execute(
    parameters: ToolExecutionPlan['parameters'],
    executionId: string,
  ): ToolExecutionResult;
}
