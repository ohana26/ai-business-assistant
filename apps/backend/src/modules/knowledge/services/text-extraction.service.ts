import { BadRequestException, Injectable } from '@nestjs/common';
import { AssetContentType } from '@prisma/client';
import { PDFParse } from 'pdf-parse';

export type ExtractedDocument = {
  text: string;
  pageCount?: number;
  pages?: Array<{
    pageNumber: number;
    text: string;
  }>;
  documentInfo: {
    contentType: AssetContentType;
  };
};

@Injectable()
export class TextExtractionService {
  async extractText(
    buffer: Buffer,
    contentType: AssetContentType,
  ): Promise<string> {
    const extracted = await this.extractDocument(buffer, contentType);
    return extracted.text;
  }

  async extractDocument(
    buffer: Buffer,
    contentType: AssetContentType,
  ): Promise<ExtractedDocument> {
    switch (contentType) {
      case AssetContentType.PDF:
        return this.extractPdfDocument(buffer);
      case AssetContentType.TXT:
      case AssetContentType.MARKDOWN:
      case AssetContentType.HTML:
      case AssetContentType.CSV:
      case AssetContentType.JSON: {
        const text = buffer.toString('utf-8');
        return {
          text,
          pageCount: text.trim() ? 1 : 0,
          pages: text.trim()
            ? [
                {
                  pageNumber: 1,
                  text,
                },
              ]
            : [],
          documentInfo: { contentType },
        };
      }
      default:
        throw new BadRequestException(
          `Unsupported content type for extraction: ${contentType}`,
        );
    }
  }

  private async extractPdfDocument(buffer: Buffer): Promise<ExtractedDocument> {
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    const parsed = (await parser.getText()) as {
      text?: string;
      total?: number;
      pages?: Array<{
        page?: number;
        text?: string;
      }>;
    };
    await parser.destroy();
    const rawPages = parsed.pages ?? [];
    const pages = rawPages
      .map((page, index) => ({
        pageNumber:
          typeof page.page === 'number' && Number.isFinite(page.page)
            ? page.page
            : index + 1,
        text: page.text ?? '',
      }))
      .filter((page) => page.text.trim().length > 0);
    const pageCount =
      typeof parsed.total === 'number' && Number.isFinite(parsed.total)
        ? parsed.total
        : pages.length;

    return {
      text: parsed.text?.trim() ?? '',
      pageCount: pageCount || undefined,
      pages,
      documentInfo: {
        contentType: AssetContentType.PDF,
      },
    };
  }
}
