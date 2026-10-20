/** One warning flag raised about a scanned URL before the user is asked to open it. */
export type UrlWarning = 'ip-host' | 'punycode' | 'insecure' | 'shortener';

export interface UrlQrContent {
  readonly type: 'url';
  readonly url: string;
  readonly warnings: readonly UrlWarning[];
}

export interface TextQrContent {
  readonly type: 'text';
  readonly text: string;
}

export type WifiSecurity = 'WEP' | 'WPA' | 'nopass' | 'unknown';

export interface WifiQrContent {
  readonly type: 'wifi';
  readonly ssid: string;
  readonly password: string | null;
  readonly security: WifiSecurity;
  readonly hidden: boolean;
}

export interface ContactQrContent {
  readonly type: 'contact';
  readonly fullName: string | null;
  readonly organization: string | null;
  readonly phones: readonly string[];
  readonly emails: readonly string[];
  readonly urls: readonly string[];
  readonly address: string | null;
  readonly note: string | null;
  readonly rawVCard: string;
}

export interface EmailQrContent {
  readonly type: 'email';
  readonly address: string;
  readonly subject: string | null;
  readonly body: string | null;
}

export interface PhoneQrContent {
  readonly type: 'phone';
  readonly number: string;
}

export interface SmsQrContent {
  readonly type: 'sms';
  readonly number: string;
  readonly message: string | null;
}

export interface GeoQrContent {
  readonly type: 'geo';
  readonly latitude: number;
  readonly longitude: number;
  readonly query: string | null;
}

export interface CalendarQrContent {
  readonly type: 'calendar';
  readonly title: string;
  readonly start: Date | null;
  readonly end: Date | null;
  readonly location: string | null;
  readonly description: string | null;
}

export type QrContent =
  | UrlQrContent
  | TextQrContent
  | WifiQrContent
  | ContactQrContent
  | EmailQrContent
  | PhoneQrContent
  | SmsQrContent
  | GeoQrContent
  | CalendarQrContent;

export type QrContentType = QrContent['type'];
