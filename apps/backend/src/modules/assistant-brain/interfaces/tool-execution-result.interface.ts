export interface ToolExecutionResult {
  success: boolean;
  executionId: string;
  toolName: string;
  message: string;
  data?: Record<string, string | number | boolean | null>;
  errorCode?: string;
}
