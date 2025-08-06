import { useState } from 'react';
import BarcodeScanner from './components/module/barCode/BarcodeScanner';

const POSPage = () => {
  const [scanComplete, setScanComplete] = useState(true);
  const [scannedCode, setScannedCode] = useState('');

  const handleScanResult = (code: string) => {
    setScannedCode(code);
  };

  const handleScanComplete = (completed: boolean) => {
    setScanComplete(completed);
  };

  const startScan = () => {
    setScannedCode('');
    setScanComplete(false);
  };

  return (
    <div className='p-4'>
      <h1 className='text-xl font-bold mb-4'>POS Barcode Scanner</h1>

      {!scanComplete && (
        <div className='mb-4'>
          <BarcodeScanner
            onResult={handleScanResult}
            onScanComplete={handleScanComplete}
          />
        </div>
      )}

      <div className='mt-4'>
        <p className='text-lg font-semibold'>Scanned Code:</p>
        <p className='text-blue-600 text-xl'>{scannedCode || '—'}</p>
      </div>

      {scanComplete ? (
        <button
          onClick={startScan}
          className='mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition'
        >
          Scan Now
        </button>
      ) : (
        <button
          onClick={() => setScanComplete(true)}
          className='mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition'
        >
          Stop Scan
        </button>
      )}
    </div>
  );
};

export default POSPage;
