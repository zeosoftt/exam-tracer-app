import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split('.').map((part) => Number.parseInt(part, 10));
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) return true;
  if (parts[0] === 10) return true;
  if (parts[0] === 127) return true;
  if (parts[0] === 0) return true;
  if (parts[0] === 192 && parts[1] === 168) return true;
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  if (parts[0] === 169 && parts[1] === 254) return true;
  return false;
}

function isBlockedIpv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  return normalized === '::1' || normalized.startsWith('fc') || normalized.startsWith('fd') || normalized.startsWith('fe80');
}

function assertResolvableHostIsPublic(hostname: string): void {
  if (hostname === 'localhost' || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    throw new Error('Bu adres desteklenmiyor.');
  }
}

/** Her kurumun kendi alan adında yayınladığı https sonuç linklerini kabul eder (SSRF korumalı). */
export async function validateInstitutionResultUrl(rawUrl: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    throw new Error('Geçerli bir sonuç linki girin.');
  }

  if (parsed.protocol !== 'https:') {
    throw new Error('Link https ile başlamalıdır.');
  }

  if (parsed.username || parsed.password) {
    throw new Error('Kimlik bilgisi içeren linkler desteklenmez.');
  }

  if (!parsed.pathname || parsed.pathname === '/') {
    throw new Error('Sonuç sayfası linki eksik görünüyor.');
  }

  const host = parsed.hostname.toLowerCase();
  assertResolvableHostIsPublic(host);

  const ipVersion = isIP(host);
  if (ipVersion === 4) {
    if (isPrivateIpv4(host)) throw new Error('Bu adres desteklenmiyor.');
    return parsed;
  }
  if (ipVersion === 6) {
    if (isBlockedIpv6(host)) throw new Error('Bu adres desteklenmiyor.');
    return parsed;
  }

  const records = await lookup(host, { all: true });
  if (records.length === 0) {
    throw new Error('Alan adı çözümlenemedi.');
  }

  for (const record of records) {
    if (record.family === 4 && isPrivateIpv4(record.address)) {
      throw new Error('Bu adres desteklenmiyor.');
    }
    if (record.family === 6 && isBlockedIpv6(record.address)) {
      throw new Error('Bu adres desteklenmiyor.');
    }
  }

  return parsed;
}
