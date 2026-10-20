export type QrErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export interface QrEncodeOptions {
  readonly errorCorrectionLevel: QrErrorCorrectionLevel;
  readonly foregroundColor: string;
  readonly backgroundColor: string;
  readonly sizePx: number;
  readonly marginModules: number;
}

export const DEFAULT_QR_ENCODE_OPTIONS: QrEncodeOptions = {
  errorCorrectionLevel: 'M',
  foregroundColor: '#000000',
  backgroundColor: '#ffffff',
  sizePx: 512,
  marginModules: 4,
};

export interface QrMatrix {
  readonly moduleCount: number;
  readonly isDark: (row: number, col: number) => boolean;
}
