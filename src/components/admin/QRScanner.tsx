"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { X, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const containerId = "qr-reader-container";

  useEffect(() => {
    // Timeout to ensure DOM is ready
    const timer = setTimeout(() => {
      try {
        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          rememberLastUsedCamera: true,
          showTorchButtonIfSupported: true,
        };

        const scanner = new Html5QrcodeScanner(containerId, config, false);
        scannerRef.current = scanner;

        scanner.render(
          (decodedText) => {
            // Success callback
            if (decodedText) {
              scanner.clear(); // Stop scanning after success
              onScan(decodedText);
            }
          },
          (errorMessage) => {
            // Error callback (called frequently during scanning, usually safe to ignore)
            // console.warn(errorMessage);
          },
        );
      } catch (err: any) {
        console.error("Scanner Initialization Error:", err);
        setError("Could not start camera. Please check permissions.");
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (e) {
          // Ignore clear errors during unmount
        }
      }
    };
  }, [onScan]);

  const resetScanner = () => {
    window.location.reload(); // Simplest way to reset camera state if it gets stuck
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-6">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex flex-col">
            <h3 className="text-white font-bold tracking-tight">QR Scanner</h3>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">
              Point camera at QR code
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={resetScanner}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Scanner Body */}
        <div className="p-4 bg-zinc-950 min-h-[300px] flex items-center justify-center">
          {error ? (
            <div className="text-center space-y-4 p-8">
              <div className="bg-red-500/10 border border-red-500/20 rounded-full p-3 w-fit mx-auto">
                <X className="h-6 w-6 text-red-500" />
              </div>
              <p className="text-red-400 text-sm font-medium">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="border-zinc-800 text-zinc-400"
              >
                Grant Permissions & Retry
              </Button>
            </div>
          ) : (
            <div
              id={containerId}
              className="w-full overflow-hidden rounded-xl border border-zinc-900"
            />
          )}
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/30">
          <p className="text-[10px] text-center text-zinc-500 leading-relaxed uppercase tracking-tighter">
            Supported codes: <span className="text-zinc-400">GY-USER-QR</span>
          </p>
        </div>
      </div>

      {/* Tap to close overlay */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
}
