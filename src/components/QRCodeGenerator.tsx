import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  url: string;
  size?: number;
}

export default function QRCodeGenerator({ url, size = 180 }: QRCodeGeneratorProps) {
  const [show, setShow] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!show) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    QRCode.toCanvas(canvas, url, {
      width: size,
      margin: 2,
      color: { dark: '#00f5d4', light: '#06162a' },
      errorCorrectionLevel: 'H',
    }, (err) => {
      if (err) console.error('QR Code error:', err);
    });
  }, [show, url, size]);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShow(!show)}
        className="btn-glow px-6 py-2.5 border border-[rgba(67,97,238,0.3)] text-[#8a92a3] text-sm font-mono rounded-lg flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
        </svg>
        {show ? '隐藏二维码' : '生成二维码'}
      </button>

      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 glass-panel p-4 border border-[rgba(0,245,212,0.3)] z-50">
          <canvas ref={canvasRef} className="rounded" />
          <p className="text-[9px] text-[#8a92a3] font-mono text-center mt-2 truncate max-w-[180px]">{url}</p>
        </div>
      )}
    </div>
  );
}
