import type { QrContent, QrContentType } from './qr-content.model';

export type HistorySource = 'scanned' | 'created';

export interface HistoryEntry {
  readonly id: string;
  readonly source: HistorySource;
  /** The raw string that was scanned, or that a generated code encodes. */
  readonly rawValue: string;
  readonly content: QrContent;
  readonly createdAt: number;
  readonly favorite: boolean;
}

export interface HistoryQuery {
  readonly searchText?: string;
  readonly contentType?: QrContentType;
  readonly favoritesOnly?: boolean;
  readonly sort?: 'newest' | 'oldest';
}
