import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type TextChunk = {
  index: number;
  content: string;
  startOffset: number;
  endOffset: number;
  section?: string;
};

@Injectable()
export class ChunkingService {
  private readonly chunkSize: number;
  private readonly overlap: number;

  constructor(private readonly configService: ConfigService) {
    this.chunkSize = Math.max(
      200,
      this.configService.get<number>('app.chunkSize', 1000),
    );
    this.overlap = Math.max(
      0,
      Math.min(
        this.chunkSize - 1,
        this.configService.get<number>('app.chunkOverlap', 200),
      ),
    );
  }

  chunkText(text: string): TextChunk[] {
    const normalized = text.replace(/\r\n/g, '\n').trim();
    if (!normalized) {
      return [];
    }

    const chunks: TextChunk[] = [];
    let cursor = 0;
    let index = 0;
    let lastKnownSection: string | undefined;

    while (cursor < normalized.length) {
      const targetEnd = Math.min(cursor + this.chunkSize, normalized.length);
      let end = targetEnd;
      if (targetEnd < normalized.length) {
        const lastSpace = normalized.lastIndexOf(' ', targetEnd);
        if (lastSpace > cursor + Math.floor(this.chunkSize * 0.5)) {
          end = lastSpace;
        }
      }

      const chunk = normalized.slice(cursor, end).trim();
      if (chunk) {
        const inferredSection = this.inferSection(chunk) ?? lastKnownSection;
        if (inferredSection) {
          lastKnownSection = inferredSection;
        }
        chunks.push({
          index,
          content: chunk,
          startOffset: cursor,
          endOffset: end,
          section: inferredSection,
        });
        index += 1;
      }

      if (end >= normalized.length) {
        break;
      }
      cursor = Math.max(end - this.overlap, cursor + 1);
    }

    return chunks;
  }

  private inferSection(chunk: string): string | undefined {
    const lines = chunk
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 6);
    if (lines.length === 0) {
      return undefined;
    }

    const markdownHeading = lines.find((line) => /^#{1,6}\s+/.test(line));
    if (markdownHeading) {
      return markdownHeading.replace(/^#{1,6}\s+/, '').trim();
    }

    const sectionByColon = lines.find(
      (line) => line.endsWith(':') && line.length <= 120,
    );
    if (sectionByColon) {
      return sectionByColon.replace(/:$/, '').trim();
    }

    const titleCaseLine = lines.find(
      (line) =>
        line.length <= 120 &&
        !/[.!?]$/.test(line) &&
        /^[A-Z][A-Za-z0-9\s/&()-]+$/.test(line),
    );
    return titleCaseLine;
  }
}
