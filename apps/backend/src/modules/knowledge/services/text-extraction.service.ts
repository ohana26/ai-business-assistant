import { BadRequestException, Injectable } from '@nestjs/common';
import { AssetContentType } from '@prisma/client';
import { PDFParse } from 'pdf-parse';

@Injectable()
export class TextExtractionService {
  async extractText(
    buffer: Buffer,
    contentType: AssetContentType,
  ): Promise<string> {
    switch (contentType) {
      case AssetContentType.PDF:
        return this.extractPdfText(buffer);
      case AssetContentType.TXT:
      case AssetContentType.MARKDOWN:
        return buffer.toString('utf-8');
      default:
        throw new BadRequestException(
          `Unsupported content type for extraction: ${contentType}`,
        );
    }
  }

  private async extractPdfText(buffer: Buffer): Promise<string> {
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    const parsed = await parser.getText();
    await parser.destroy();
    return parsed.text?.trim() ?? '';
  }
}
