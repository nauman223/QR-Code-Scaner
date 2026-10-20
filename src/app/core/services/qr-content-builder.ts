import { Injectable } from '@angular/core';

import type {
  ContactFormData,
  EmailFormData,
  PhoneFormData,
  QrFormData,
  SmsFormData,
  TextFormData,
  UrlFormData,
  WifiFormData,
} from '@core/models/qr-generator.model';

function escapeQrField(value: string): string {
  return value.replace(/([\\;,:])/g, '\\$1');
}

function buildUrl(data: UrlFormData): string {
  return data.url.trim();
}

function buildText(data: TextFormData): string {
  return data.text;
}

function buildWifi(data: WifiFormData): string {
  const passwordField =
    data.security === 'nopass' ? '' : `P:${escapeQrField(data.password.trim())};`;
  return `WIFI:T:${data.security};S:${escapeQrField(data.ssid.trim())};${passwordField}H:${
    data.hidden ? 'true' : 'false'
  };;`;
}

function buildContact(data: ContactFormData): string {
  const fullName = data.fullName.trim();
  const nameParts = fullName.split(/\s+/).filter((part) => part.length > 0);
  const familyName =
    nameParts.length > 1 ? (nameParts[nameParts.length - 1] ?? '') : (nameParts[0] ?? '');
  const givenName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : '';

  const lines = ['BEGIN:VCARD', 'VERSION:3.0', `N:${familyName};${givenName};;;`];
  if (fullName.length > 0) {
    lines.push(`FN:${fullName}`);
  }
  if (data.organization.trim().length > 0) {
    lines.push(`ORG:${data.organization.trim()}`);
  }
  if (data.phone.trim().length > 0) {
    lines.push(`TEL:${data.phone.trim()}`);
  }
  if (data.email.trim().length > 0) {
    lines.push(`EMAIL:${data.email.trim()}`);
  }
  if (data.url.trim().length > 0) {
    lines.push(`URL:${data.url.trim()}`);
  }
  lines.push('END:VCARD');
  return lines.join('\n');
}

function buildEmail(data: EmailFormData): string {
  const params = new URLSearchParams();
  if (data.subject.trim().length > 0) {
    params.set('subject', data.subject.trim());
  }
  if (data.body.trim().length > 0) {
    params.set('body', data.body.trim());
  }
  const query = params.toString();
  return `mailto:${data.address.trim()}${query.length > 0 ? `?${query}` : ''}`;
}

function buildPhone(data: PhoneFormData): string {
  return `tel:${data.number.trim()}`;
}

function buildSms(data: SmsFormData): string {
  const params = new URLSearchParams();
  if (data.message.trim().length > 0) {
    params.set('body', data.message.trim());
  }
  const query = params.toString();
  return `sms:${data.number.trim()}${query.length > 0 ? `?${query}` : ''}`;
}

/**
 * Encodes typed generator form data into the raw string that gets fed to the
 * QR encoder. Pure: same input always yields the same output.
 */
export function buildQrContent(data: QrFormData): string {
  switch (data.type) {
    case 'url':
      return buildUrl(data);
    case 'text':
      return buildText(data);
    case 'wifi':
      return buildWifi(data);
    case 'contact':
      return buildContact(data);
    case 'email':
      return buildEmail(data);
    case 'phone':
      return buildPhone(data);
    case 'sms':
      return buildSms(data);
    default: {
      const exhaustiveCheck: never = data;
      throw new Error(`Unhandled QR form type: ${JSON.stringify(exhaustiveCheck)}`);
    }
  }
}

@Injectable({ providedIn: 'root' })
export class QrContentBuilder {
  public build(data: QrFormData): string {
    return buildQrContent(data);
  }
}
