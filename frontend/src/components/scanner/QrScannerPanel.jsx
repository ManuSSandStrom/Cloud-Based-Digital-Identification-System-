import { useEffect, useRef, useState } from 'react';
import Button from '../common/Button.jsx';

export default function QrScannerPanel({ onDetected }) {
  const scannerRef = useRef(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    let html5QrCode;

    const startScanner = async () => {
      if (!active || !scannerRef.current) return;

      const { Html5Qrcode } = await import('html5-qrcode');
      html5QrCode = new Html5Qrcode(scannerRef.current.id);

      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          onDetected(decodedText);
          setActive(false);
          html5QrCode.stop().catch(() => {});
        },
        () => {},
      );
    };

    startScanner().catch(() => {
      setActive(false);
    });

    return () => {
      if (html5QrCode?.isScanning) {
        html5QrCode.stop().catch(() => {});
      }
    };
  }, [active, onDetected]);

  return (
    <div className="space-y-4">
      <div
        id="digital-id-qr-reader"
        ref={scannerRef}
        className="min-h-56 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950"
      />
      <Button variant={active ? 'secondary' : 'primary'} onClick={() => setActive((current) => !current)}>
        {active ? 'Stop Scanner' : 'Start Camera Scanner'}
      </Button>
    </div>
  );
}
