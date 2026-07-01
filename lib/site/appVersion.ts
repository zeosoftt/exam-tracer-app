import packageJson from '../../package.json';

/** package.json sürümü — build sırasında NEXT_PUBLIC_APP_VERSION ile senkron tutulur */
export const APP_VERSION = packageJson.version;

/** İstemci + sunucu (next.config `env`) */
export const PUBLIC_APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? APP_VERSION;

export function getAppVersionLabel(version: string = PUBLIC_APP_VERSION): string {
  const buildRef = process.env.NEXT_PUBLIC_BUILD_REF?.trim();
  if (buildRef) {
    return `v${version} · ${buildRef}`;
  }
  return `v${version}`;
}
