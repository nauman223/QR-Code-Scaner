import { Injectable, signal } from '@angular/core';
import { BarcodeScanner, type CameraPermissionState } from '@capacitor-mlkit/barcode-scanning';

export type { CameraPermissionState };

/**
 * Camera permission state for the live scanner, backed by the ML Kit plugin
 * (the same plugin ultimately performs the runtime permission request).
 */
@Injectable({ providedIn: 'root' })
export class PermissionsService {
  private readonly cameraStateSignal = signal<CameraPermissionState>('prompt');

  public readonly cameraState = this.cameraStateSignal.asReadonly();

  public async checkCameraPermission(): Promise<CameraPermissionState> {
    const { camera } = await BarcodeScanner.checkPermissions();
    this.cameraStateSignal.set(camera);
    return camera;
  }

  /** Triggers the OS permission prompt. Call only after explaining why, per PROJECT rules. */
  public async requestCameraPermission(): Promise<CameraPermissionState> {
    const { camera } = await BarcodeScanner.requestPermissions();
    this.cameraStateSignal.set(camera);
    return camera;
  }

  /** Deep-links into the OS app settings screen, used after a permanent denial. */
  public async openAppSettings(): Promise<void> {
    await BarcodeScanner.openSettings();
  }
}
