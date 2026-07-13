import { Inject, Injectable } from '@nestjs/common';
import type { Tool } from '../interfaces/tool.interface';

export const ASSISTANT_BRAIN_TOOLS = 'ASSISTANT_BRAIN_TOOLS';

@Injectable()
export class ToolRegistryService {
  private readonly toolMap: Map<string, Tool>;

  constructor(
    @Inject(ASSISTANT_BRAIN_TOOLS)
    private readonly tools: Tool[],
  ) {
    this.toolMap = new Map(this.tools.map((tool) => [tool.name(), tool]));
  }

  resolve(toolName: string): Tool | null {
    return this.toolMap.get(toolName) ?? null;
  }

  listToolDefinitions() {
    return this.tools.map((tool) => ({
      name: tool.name(),
      description: tool.description(),
      schema: tool.schema(),
    }));
  }
}
