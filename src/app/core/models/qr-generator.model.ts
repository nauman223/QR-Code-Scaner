import type { WifiSecurity } from './qr-content.model';

export interface UrlFormData {
  readonly type: 'url';
  readonly url: string;
}

export interface TextFormData {
  readonly type: 'text';
  readonly text: string;
}

export interface WifiFormData {
  readonly type: 'wifi';
  readonly ssid: string;
  readonly password: string;
  readonly security: Extract<WifiSecurity, 'WPA' | 'WEP' | 'nopass'>;
  readonly hidden: boolean;
}

export interface ContactFormData {
  readonly type: 'contact';
  readonly fullName: string;
  readonly organization: string;
  readonly phone: string;
  readonly email: string;
  readonly url: string;
}

export interface EmailFormData {
  readonly type: 'email';
  readonly address: string;
  readonly subject: string;
  readonly body: string;
}

export interface PhoneFormData {
  readonly type: 'phone';
  readonly number: string;
}

export interface SmsFormData {
  readonly type: 'sms';
  readonly number: string;
  readonly message: string;
}

export type QrFormData =
  | UrlFormData
  | TextFormData
  | WifiFormData
  | ContactFormData
  | EmailFormData
  | PhoneFormData
  | SmsFormData;

export type QrFormType = QrFormData['type'];
