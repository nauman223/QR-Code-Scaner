import { Injectable } from '@angular/core';
import qrcode from 'qrcode-generator';

import type {
  QrEncodeOptions,
  QrErrorCorrectionLevel,
  QrMatrix,
} from '@core/models/qr-encoder.model';

/**
 * Generates the QR bit matrix via `qrcode-generator` (versions 1-40, byte
 * mode, auto version selection, ECC L/M/Q/H) — see PROJECT dependency
 * approval notes for why this one piece is not hand-rolled. Everything
 * downstream of the matrix (SVG/PNG rendering, colors, sizing, contrast
 * checking) is our own code.
 */
export function encodeQrMatrix(
  data: string,
  errorCorrectionLevel: QrErrorCorrectionLevel,
): QrMatrix {
  const instance = qrcode(0, errorCorrectionLevel);
  instance.addData(data, 'Byte');
  instance.make();
  const moduleCount = instance.getModuleCount();
  return {
    moduleCount,
    isDark: (row: number, col: number) => instance.isDark(row, col),
  };
}

/** Rounds a module's pixel span to whole pixels so adjacent cells never leave a hairline gap. */
function moduleBounds(
  index: number,
  cellSize: number,
): { readonly start: number; readonly size: number } {
  const start = Math.round(index * cellSize);
  const end = Math.round((index + 1) * cellSize);
  return { start, size: end - start };
}

export function matrixToSvg(matrix: QrMatrix, options: QrEncodeOptions): string {
  const totalModules = matrix.moduleCount + options.marginModules * 2;
  const cellSize = options.sizePx / totalModules;

  const rects: string[] = [];
  for (let row = 0; row < matrix.moduleCount; row += 1) {
    const y = moduleBounds(row + options.marginModules, cellSize);
    for (let col = 0; col < matrix.moduleCount; col += 1) {
      if (matrix.isDark(row, col)) {
        const x = moduleBounds(col + options.marginModules, cellSize);
        rects.push(`<rect x="${x.start}" y="${y.start}" width="${x.size}" height="${y.size}"/>`);
      }
    }
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${options.sizePx}" height="${options.sizePx}" ` +
    `viewBox="0 0 ${options.sizePx} ${options.sizePx}" shape-rendering="crispEdges">` +
    `<rect width="100%" height="100%" fill="${options.backgroundColor}"/>` +
    `<g fill="${options.foregroundColor}">${rects.join('')}</g>` +
    `</svg>`
  );
}

function drawMatrix(
  context: CanvasRenderingContext2D,
  matrix: QrMatrix,
  options: QrEncodeOptions,
): void {
  const totalModules = matrix.moduleCount + options.marginModules * 2;
  const cellSize = options.sizePx / totalModules;

  context.fillStyle = options.backgroundColor;
  context.fillRect(0, 0, options.sizePx, options.sizePx);

  context.fillStyle = options.foregroundColor;
  for (let row = 0; row < matrix.moduleCount; row += 1) {
    const y = moduleBounds(row + options.marginModules, cellSize);
    for (let col = 0; col < matrix.moduleCount; col += 1) {
      if (matrix.isDark(row, col)) {
        const x = moduleBounds(col + options.marginModules, cellSize);
        context.fillRect(x.start, y.start, x.size, y.size);
      }
    }
  }
}

/** Renders the matrix to a PNG `Blob`. Browser-only (uses `HTMLCanvasElement`). */
export async function matrixToPngBlob(matrix: QrMatrix, options: QrEncodeOptions): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = options.sizePx;
  canvas.height = options.sizePx;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('2D canvas context is not available on this platform.');
  }
  drawMatrix(context, matrix, options);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to encode the QR code as PNG.'));
      }
    }, 'image/png');
  });
}

function hexToRgb(hex: string): readonly [number, number, number] {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) {
    throw new Error(`Invalid hex color: "${hex}"`);
  }
  const value = match[1] ?? '000000';
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ];
}

function relativeLuminance(hex: string): number {
  const channels = hexToRgb(hex).map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  const [r, g, b] = channels as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG-style contrast ratio (1 to 21) between two hex colors. */
export function contrastRatio(foreground: string, background: string): number {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

// A camera reading a QR code needs much less contrast than WCAG's 4.5:1 text
// threshold, but pairs below this are a real scan-failure risk in anything
// but ideal lighting — this is a scannability heuristic, not an accessibility
// contrast check.
const MIN_SCANNABLE_CONTRAST_RATIO = 2.5;

export function hasLowScanContrast(foreground: string, background: string): boolean {
  return contrastRatio(foreground, background) < MIN_SCANNABLE_CONTRAST_RATIO;
}

@Injectable({ providedIn: 'root' })
export class QrEncoderService {
  public encode(data: string, options: QrEncodeOptions): QrMatrix {
    return encodeQrMatrix(data, options.errorCorrectionLevel);
  }

  public toSvg(matrix: QrMatrix, options: QrEncodeOptions): string {
    return matrixToSvg(matrix, options);
  }

  public async toPngBlob(matrix: QrMatrix, options: QrEncodeOptions): Promise<Blob> {
    return matrixToPngBlob(matrix, options);
  }

  public hasLowScanContrast(foreground: string, background: string): boolean {
    return hasLowScanContrast(foreground, background);
  }
}
