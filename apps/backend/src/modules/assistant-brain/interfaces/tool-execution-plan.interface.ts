export interface ToolExecutionPlan {
  toolName: string;
  reason: string;
  confidence: number;
  parameters: Record<string, string | number | boolean | null>;
  missingInformation: string[];
  requiresUserConfirmation: boolean;
}
