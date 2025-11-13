import React, { useRef, useEffect, useImperativeHandle, forwardRef, useState } from 'react';

interface SignatureCanvasProps {
  width?: number;
  height?: number;
}

export interface SignatureCanvasRef {
  clear: () => void;
  getSignatureData: () => string | null;
  isEmpty: () => boolean;
}

const SignatureCanvas = forwardRef<SignatureCanvasRef, SignatureCanvasProps>(({ width = 500, height = 200 }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const getContext = () => canvasRef.current?.getContext('2d');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = getContext();
    if (!ctx) return;

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

  }, []);

  const getCoordinates = (event: MouseEvent | TouchEvent): { x: number; y: number } | null => {
    if (!canvasRef.current) return null;
    const rect = canvasRef.current.getBoundingClientRect();
    if (event instanceof MouseEvent) {
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }
    if (event.touches && event.touches.length > 0) {
      return { x: event.touches[0].clientX - rect.left, y: event.touches[0].clientY - rect.top };
    }
    return null;
  };

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const coords = getCoordinates(event.nativeEvent);
    if (!coords) return;
    const ctx = getContext();
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const coords = getCoordinates(event.nativeEvent);
    if (!coords) return;
    const ctx = getContext();
    if (!ctx) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    const ctx = getContext();
    if (!ctx) return;
    ctx.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawn(false);
    }
  };

  useImperativeHandle(ref, () => ({
    clear: clearCanvas,
    getSignatureData: () => {
      if (!canvasRef.current || !hasDrawn) return null;
      return canvasRef.current.toDataURL('image/png');
    },
    isEmpty: () => !hasDrawn,
  }));

  return (
    <div className="relative w-full">
      {!hasDrawn && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-400 pointer-events-none" aria-hidden="true">
          Tanda tangan di sini
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="bg-slate-50 border border-slate-300 rounded-lg w-full cursor-crosshair touch-none"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      <button
        type="button"
        onClick={clearCanvas}
        className="absolute top-2 right-2 bg-slate-200 text-slate-700 text-xs font-semibold py-1 px-3 rounded-full hover:bg-slate-300 transition-colors"
      >
        Bersihkan
      </button>
    </div>
  );
});

export default SignatureCanvas;