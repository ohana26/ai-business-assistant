import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type TextChunk = {
  index: number;
  content: string;
  startOffset: number;
  endOffset: number;
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
        chunks.push({
          index,
          content: chunk,
          startOffset: cursor,
          endOffset: end,
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
}
