import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fdfbf7',
        }}
      >
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: '#d4af37',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 72,
            marginBottom: 32,
          }}
        >
          🛍️
        </div>
        <div style={{ fontSize: 72, fontWeight: 700, color: '#1c1c1c', display: 'flex' }}>
          Marketologi
        </div>
        <div style={{ fontSize: 30, color: '#a5760a', marginTop: 18, display: 'flex' }}>
          A marketplace built on genuine trust
        </div>
      </div>
    ),
    { ...size }
  );
}