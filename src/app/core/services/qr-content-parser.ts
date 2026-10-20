import { Injectable } from '@angular/core';

import type {
  CalendarQrContent,
  ContactQrContent,
  EmailQrContent,
  GeoQrContent,
  PhoneQrContent,
  QrContent,
  SmsQrContent,
  UrlQrContent,
  UrlWarning,
  WifiQrContent,
  WifiSecurity,
} from '@core/models/qr-content.model';

const SHORTENER_HOSTS = new Set([
  'bit.ly',
  'tinyurl.com',
  't.co',
  'goo.gl',
  'ow.ly',
  'is.gd',
  'buff.ly',
  'rebrand.ly',
  'cutt.ly',
  'shorturl.at',
  'rb.gy',
  'tiny.cc',
  'lnkd.in',
]);

/**
 * Splits `input` on `delimiter`, treating a backslash-escaped delimiter as a
 * literal character rather than a boundary (the escaping scheme used by both
 * the WIFI: and MECARD: QR payload formats).
 */
function splitEscaped(input: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let index = 0;
  while (index < input.length) {
    const char = input.charAt(index);
    if (char === '\\' && index + 1 < input.length) {
      current += char + input.charAt(index + 1);
      index += 2;
      continue;
    }
    if (char === delimiter) {
      result.push(current);
      current = '';
      index += 1;
      continue;
    }
    current += char;
    index += 1;
  }
  result.push(current);
  return result;
}

function unescapeQrField(value: string): string {
  return value.replace(/\\([\\;,:])/g, '$1');
}

function isIpHost(hostname: string): boolean {
  const isIpv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
  const isBracketedIpv6 = hostname.startsWith('[') && hostname.endsWith(']');
  return isIpv4 || isBracketedIpv6;
}

function parseUrl(raw: string): UrlQrContent | null {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return null;
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return null;
  }

  const warnings: UrlWarning[] = [];
  if (parsed.protocol === 'http:') {
    warnings.push('insecure');
  }
  if (isIpHost(parsed.hostname)) {
    warnings.push('ip-host');
  }
  if (parsed.hostname.split('.').some((label) => label.startsWith('xn--'))) {
    warnings.push('punycode');
  }
  if (SHORTENER_HOSTS.has(parsed.hostname.toLowerCase())) {
    warnings.push('shortener');
  }

  return { type: 'url', url: raw, warnings };
}

function normalizeWifiSecurity(value: string): WifiSecurity {
  const upper = value.toUpperCase();
  if (upper === 'WEP') {
    return 'WEP';
  }
  if (upper === 'WPA' || upper === 'WPA2' || upper === 'WPA3') {
    return 'WPA';
  }
  if (upper === 'NOPASS' || upper.length === 0) {
    return 'nopass';
  }
  return 'unknown';
}

function parseWifi(raw: string): WifiQrContent | null {
  if (!/^WIFI:/i.test(raw)) {
    return null;
  }
  const body = raw.slice(raw.indexOf(':') + 1);
  const fields = splitEscaped(body, ';');

  let ssid = '';
  let password: string | null = null;
  let securityRaw = '';
  let hidden = false;

  for (const field of fields) {
    if (field.length === 0) {
      continue;
    }
    const separatorIndex = field.indexOf(':');
    if (separatorIndex === -1) {
      continue;
    }
    const key = field.slice(0, separatorIndex).toUpperCase();
    const value = unescapeQrField(field.slice(separatorIndex + 1));
    switch (key) {
      case 'S':
        ssid = value;
        break;
      case 'P':
        password = value;
        break;
      case 'T':
        securityRaw = value;
        break;
      case 'H':
        hidden = value.toLowerCase() === 'true';
        break;
      default:
        break;
    }
  }

  return {
    type: 'wifi',
    ssid,
    password: password !== null && password.length > 0 ? password : null,
    security: normalizeWifiSecurity(securityRaw),
    hidden,
  };
}

function parseMeCard(raw: string): ContactQrContent {
  const body = raw.slice(raw.indexOf(':') + 1);
  const fields = splitEscaped(body, ';');

  let fullName: string | null = null;
  let organization: string | null = null;
  const phones: string[] = [];
  const emails: string[] = [];
  const urls: string[] = [];
  let address: string | null = null;
  let note: string | null = null;

  for (const field of fields) {
    if (field.length === 0) {
      continue;
    }
    const separatorIndex = field.indexOf(':');
    if (separatorIndex === -1) {
      continue;
    }
    const key = field.slice(0, separatorIndex).toUpperCase();
    const value = unescapeQrField(field.slice(separatorIndex + 1));
    if (value.length === 0) {
      continue;
    }
    switch (key) {
      case 'N':
        fullName = value
          .split(',')
          .filter((part) => part.length > 0)
          .reverse()
          .join(' ');
        break;
      case 'ORG':
        organization = value;
        break;
      case 'TEL':
        phones.push(value);
        break;
      case 'EMAIL':
        emails.push(value);
        break;
      case 'URL':
        urls.push(value);
        break;
      case 'ADR':
        address = value;
        break;
      case 'NOTE':
        note = value;
        break;
      default:
        break;
    }
  }

  return {
    type: 'contact',
    fullName,
    organization,
    phones,
    emails,
    urls,
    address,
    note,
    rawVCard: raw,
  };
}

function unfoldLines(raw: string): string[] {
  const unfolded = raw.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '');
  return unfolded
    .split(/\r\n|\n|\r/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function parseVCard(raw: string): ContactQrContent {
  const lines = unfoldLines(raw);

  let fullName: string | null = null;
  let structuredName: string | null = null;
  let organization: string | null = null;
  const phones: string[] = [];
  const emails: string[] = [];
  const urls: string[] = [];
  let address: string | null = null;
  let note: string | null = null;

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) {
      continue;
    }
    const propertyPart = line.slice(0, colonIndex);
    const value = line.slice(colonIndex + 1);
    const propertyName = (propertyPart.split(';')[0] ?? '').toUpperCase();
    if (value.length === 0) {
      continue;
    }

    switch (propertyName) {
      case 'FN':
        fullName = value;
        break;
      case 'N':
        structuredName = value
          .split(';')
          .filter((part) => part.length > 0)
          .join(' ');
        break;
      case 'ORG':
        organization = value.replace(/;/g, ' ').trim();
        break;
      case 'TEL':
        phones.push(value);
        break;
      case 'EMAIL':
        emails.push(value);
        break;
      case 'URL':
        urls.push(value);
        break;
      case 'ADR':
        address = value
          .replace(/;/g, ', ')
          .replace(/(, )+/g, ', ')
          .replace(/^, |, $/g, '')
          .trim();
        break;
      case 'NOTE':
        note = value;
        break;
      default:
        break;
    }
  }

  return {
    type: 'contact',
    fullName: fullName ?? structuredName,
    organization,
    phones,
    emails,
    urls,
    address,
    note,
    rawVCard: raw,
  };
}

function parseContact(raw: string): ContactQrContent | null {
  const trimmed = raw.trim();
  if (/^MECARD:/i.test(trimmed)) {
    return parseMeCard(trimmed);
  }
  if (/^BEGIN:VCARD/i.test(trimmed)) {
    return parseVCard(trimmed);
  }
  return null;
}

function parseEmail(raw: string): EmailQrContent | null {
  if (!/^mailto:/i.test(raw)) {
    return null;
  }
  const withoutScheme = raw.slice(raw.indexOf(':') + 1);
  const queryIndex = withoutScheme.indexOf('?');
  const addressPart = queryIndex === -1 ? withoutScheme : withoutScheme.slice(0, queryIndex);
  const queryString = queryIndex === -1 ? '' : withoutScheme.slice(queryIndex + 1);
  const params = new URLSearchParams(queryString);

  let address: string;
  try {
    address = decodeURIComponent(addressPart);
  } catch {
    address = addressPart;
  }
  if (address.length === 0) {
    return null;
  }

  return { type: 'email', address, subject: params.get('subject'), body: params.get('body') };
}

function parsePhone(raw: string): PhoneQrContent | null {
  if (!/^tel:/i.test(raw)) {
    return null;
  }
  const rest = raw.slice(raw.indexOf(':') + 1);
  let number: string;
  try {
    number = decodeURIComponent(rest);
  } catch {
    number = rest;
  }
  return number.length > 0 ? { type: 'phone', number } : null;
}

function parseSms(raw: string): SmsQrContent | null {
  const match = /^(?:sms|smsto):(.*)$/i.exec(raw);
  if (!match) {
    return null;
  }
  const rest = match[1] ?? '';
  const queryIndex = rest.indexOf('?');
  const colonIndex = rest.indexOf(':');

  let numberPart: string;
  let message: string | null = null;

  if (queryIndex !== -1 && (colonIndex === -1 || queryIndex < colonIndex)) {
    numberPart = rest.slice(0, queryIndex);
    message = new URLSearchParams(rest.slice(queryIndex + 1)).get('body');
  } else if (colonIndex !== -1) {
    numberPart = rest.slice(0, colonIndex);
    try {
      message = decodeURIComponent(rest.slice(colonIndex + 1));
    } catch {
      message = rest.slice(colonIndex + 1);
    }
  } else {
    numberPart = rest;
  }

  let number: string;
  try {
    number = decodeURIComponent(numberPart);
  } catch {
    number = numberPart;
  }

  return number.length > 0 ? { type: 'sms', number, message } : null;
}

function parseGeo(raw: string): GeoQrContent | null {
  const match = /^geo:([^,?]+),([^,?]+)(?:,[^,?]+)?(?:\?(.*))?$/i.exec(raw);
  if (!match) {
    return null;
  }
  const latitude = Number.parseFloat(match[1] ?? '');
  const longitude = Number.parseFloat(match[2] ?? '');
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }
  const query = match[3] !== undefined ? new URLSearchParams(match[3]).get('q') : null;
  return { type: 'geo', latitude, longitude, query };
}

function unescapeIcsText(value: string): string {
  return value
    .replace(/\\n/gi, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\');
}

function parseIcsDate(value: string): Date | null {
  const match = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/.exec(value);
  if (!match) {
    return null;
  }
  const [, year, month, day, hour, minute, second, isUtc] = match;
  const y = Number.parseInt(year ?? '', 10);
  const mo = Number.parseInt(month ?? '', 10) - 1;
  const d = Number.parseInt(day ?? '', 10);
  const h = hour !== undefined ? Number.parseInt(hour, 10) : 0;
  const mi = minute !== undefined ? Number.parseInt(minute, 10) : 0;
  const s = second !== undefined ? Number.parseInt(second, 10) : 0;

  const date =
    isUtc !== undefined ? new Date(Date.UTC(y, mo, d, h, mi, s)) : new Date(y, mo, d, h, mi, s);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseCalendar(raw: string): CalendarQrContent | null {
  if (!/BEGIN:VEVENT/i.test(raw)) {
    return null;
  }
  const lines = unfoldLines(raw);

  let title = '';
  let start: Date | null = null;
  let end: Date | null = null;
  let location: string | null = null;
  let description: string | null = null;

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) {
      continue;
    }
    const propertyPart = line.slice(0, colonIndex);
    const value = line.slice(colonIndex + 1);
    const propertyName = (propertyPart.split(';')[0] ?? '').toUpperCase();

    switch (propertyName) {
      case 'SUMMARY':
        title = unescapeIcsText(value);
        break;
      case 'DTSTART':
        start = parseIcsDate(value);
        break;
      case 'DTEND':
        end = parseIcsDate(value);
        break;
      case 'LOCATION':
        location = unescapeIcsText(value);
        break;
      case 'DESCRIPTION':
        description = unescapeIcsText(value);
        break;
      default:
        break;
    }
  }

  return { type: 'calendar', title, start, end, location, description };
}

/**
 * Parses raw QR payload text into a typed, discriminated `QrContent`. Pure:
 * same input always yields the same output, no I/O, no side effects. Falls
 * back to `{ type: 'text' }` for anything that doesn't match a known format.
 */
export function parseQrContent(raw: string): QrContent {
  const trimmed = raw.trim();

  const parsers: readonly ((value: string) => QrContent | null)[] = [
    parseWifi,
    parseContact,
    parseEmail,
    parsePhone,
    parseSms,
    parseGeo,
    parseCalendar,
    parseUrl,
  ];

  for (const parser of parsers) {
    const result = parser(trimmed);
    if (result !== null) {
      return result;
    }
  }

  return { type: 'text', text: raw };
}

@Injectable({ providedIn: 'root' })
export class QrContentParser {
  public parse(raw: string): QrContent {
    return parseQrContent(raw);
  }
}
