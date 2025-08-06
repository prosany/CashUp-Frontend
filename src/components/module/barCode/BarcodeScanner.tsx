/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, BarcodeFormat } from '@zxing/browser';
import { DecodeHintType } from '@zxing/library';

type Props = {
  onResult: (code: string) => void;
  onScanComplete?: (value: boolean) => void;
};

const BarcodeScanner = ({ onResult, onScanComplete }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const hasScanned = useRef(false);
  const [error, setError] = useState<string | null>(null);

  // Stop camera and scanner helper
  const stopCamera = async () => {
    try {
      // Stop scanning controls
      if (controlsRef.current) {
        controlsRef.current.stop();
        controlsRef.current = null;
      }

      // Stop all tracks on video element's media stream
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => {
          if (track.readyState === 'live') {
            track.stop();
          }
        });
        videoRef.current.srcObject = null;
      }

      readerRef.current = null;
      hasScanned.current = false;
    } catch (err) {
      console.error('Error stopping camera:', err);
      setError('Failed to stop the camera properly.');
      throw err;
    }
  };

  useEffect(() => {
    setError(null);
    hasScanned.current = false;

    // Setup decode hints
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.AZTEC,
      BarcodeFormat.CODABAR,
      BarcodeFormat.CODE_39,
      BarcodeFormat.CODE_93,
      BarcodeFormat.CODE_128,
      BarcodeFormat.DATA_MATRIX,
      BarcodeFormat.EAN_8,
      BarcodeFormat.EAN_13,
      BarcodeFormat.ITF,
      BarcodeFormat.MAXICODE,
      BarcodeFormat.PDF_417,
      BarcodeFormat.RSS_14,
      BarcodeFormat.RSS_EXPANDED,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.UPC_EAN_EXTENSION,
    ]);

    const reader = new BrowserMultiFormatReader(hints);
    readerRef.current = reader;

    BrowserMultiFormatReader.listVideoInputDevices()
      .then((devices) => {
        if (!devices.length) throw new Error('No camera found');

        const backCamera =
          devices.find((d) => d.label.toLowerCase().includes('back')) ||
          devices[0];

        reader.decodeFromVideoDevice(
          backCamera.deviceId,
          videoRef.current!,
          async (result, error, controls) => {
            controlsRef.current = controls;

            if (result && !hasScanned.current) {
              hasScanned.current = true;

              const code = result.getText();
              onResult(code);

              try {
                await stopCamera();
                onScanComplete?.(true);
              } catch {
                // stopCamera error handled inside stopCamera
              }
            }
          }
        );
      })
      .catch((err) => {
        console.error(err);
        setError('Camera access error. Please allow permission and reload.');
      });

    return () => {
      stopCamera();
    };
  }, [onResult, onScanComplete]);

  return (
    <div className='absolute top-0 left-0 w-full h-dvh max-w-md mx-auto aspect-video overflow-hidden shadow-lg border-4 border-gray-800'>
      {error && (
        <div className='absolute top-2 left-2 right-2 bg-red-600 text-white px-3 py-1 rounded z-10 text-center font-semibold'>
          {error}
        </div>
      )}

      <video
        ref={videoRef}
        muted
        autoPlay
        playsInline
        className='absolute inset-0 w-full h-full object-cover'
      />

      <div className='absolute inset-0 pointer-events-none flex items-center justify-center'>
        <div className='w-72 h-40 border-4 border-green-400 rounded-md animate-pulse relative'>
          <div className='absolute inset-x-0 top-1/2 h-[2px] bg-green-500 animate-ping' />
        </div>
      </div>

      <div className='absolute bottom-2 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded select-none'>
        Align barcode inside the box
      </div>
    </div>
  );
};

export default BarcodeScanner;
