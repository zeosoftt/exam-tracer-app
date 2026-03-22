import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'The Goal Lab — Sınav ve hedef takip';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Sosyal paylaşım ve arama sonuçları için OG görseli (1200×630).
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 45%, #0d9488 100%)',
          padding: 80,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40,
            }}
          >
            📚
          </div>
          <span
            style={{
              fontSize: 56,
              fontWeight: 800,
              color: 'white',
              letterSpacing: -1,
            }}
          >
            The Goal Lab
          </span>
        </div>
        <p
          style={{
            fontSize: 36,
            color: 'rgba(255,255,255,0.95)',
            margin: 0,
            maxWidth: 900,
            lineHeight: 1.35,
            fontWeight: 500,
          }}
        >
          Kurumlar ve bireyler için sınav ve hedef takip — KPSS, ÖABT, ALES ve daha fazlası
        </p>
        <p
          style={{
            marginTop: 40,
            fontSize: 22,
            color: 'rgba(255,255,255,0.75)',
            fontWeight: 500,
          }}
        >
          thegoallab.com
        </p>
      </div>
    ),
    { ...size }
  );
}
