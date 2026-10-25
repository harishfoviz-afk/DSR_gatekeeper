import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Check, Upload, AlertCircle, Image } from 'lucide-react';

const PRESET_AVATARS = [
  { id: 'p1', label: 'Delivery Rider', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' },
  { id: 'p2', label: 'Guest / Friend', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80' },
  { id: 'p3', label: 'Technician', url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80' },
  { id: 'p4', label: 'Service / Cab', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80' },
];

export default function CameraCapture({ photoUrl, onPhotoCaptured }) {
  const [streamActive, setStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize camera stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Web Camera API is not supported in this environment");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStreamActive(true);
      }
    } catch (err) {
      console.warn("Camera start failed, activating fallback:", err.message);
      setCameraError(err.message || "Camera access denied or unavailable.");
      setStreamActive(false);
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
  };

  // Capture snapshot from video stream
  const captureSnapshot = () => {
    setIsCapturing(true);
    setTimeout(() => {
      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        canvas.width = video.videoWidth || 480;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');

        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to high-quality compressed JPEG data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        onPhotoCaptured(dataUrl);
        stopCamera();
      } catch (err) {
        console.error("Capture failed:", err);
      } finally {
        setIsCapturing(false);
      }
    }, 150);
  };

  // Retake photo
  const handleRetake = () => {
    onPhotoCaptured('');
    startCamera();
  };

  // Handle manual file upload / mobile camera pick
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onPhotoCaptured(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Auto-start camera if no photo yet
  useEffect(() => {
    if (!photoUrl && !cameraError) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Camera className="w-4 h-4 text-emerald-400" />
          Visitor Photo Verification
        </label>
        {photoUrl && (
          <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-semibold border border-emerald-500/40 flex items-center gap-1">
            <Check className="w-3 h-3" /> Captured
          </span>
        )}
      </div>

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        capture="user"
        className="hidden"
      />

      {/* Viewport Area */}
      <div className="relative aspect-video max-h-56 sm:max-h-64 w-full bg-slate-950 rounded-xl overflow-hidden border-2 border-slate-800 flex items-center justify-center">
        {photoUrl ? (
          // Display captured photo
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <img
              src={photoUrl}
              alt="Captured Visitor"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <button
              type="button"
              onClick={handleRetake}
              className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 rounded-lg text-xs font-semibold backdrop-blur-sm border border-slate-700 shadow-lg transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retake Photo
            </button>
          </div>
        ) : streamActive ? (
          // Live camera stream
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100"
            />
            {/* Guide overlay */}
            <div className="absolute inset-0 border-2 border-dashed border-emerald-400/40 rounded-xl m-4 pointer-events-none flex items-center justify-center">
              <span className="text-[11px] font-semibold text-emerald-300/80 bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
                Align Face Inside Frame
              </span>
            </div>

            {/* Shutter flash animation effect */}
            {isCapturing && <div className="absolute inset-0 bg-white animate-ping" />}

            {/* Snap button */}
            <div className="absolute bottom-3 inset-x-0 flex justify-center">
              <button
                type="button"
                onClick={captureSnapshot}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-full shadow-xl shadow-emerald-500/30 transform active:scale-95 transition"
              >
                <Camera className="w-5 h-5" />
                <span>Snap Photo</span>
              </button>
            </div>
          </div>
        ) : (
          // Fallback UI if camera is inactive/blocked
          <div className="p-4 text-center">
            <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-80" />
            <p className="text-xs text-slate-300 font-medium mb-1">
              {cameraError || "Camera not active or permissions blocked."}
            </p>
            <p className="text-[11px] text-slate-500 mb-3">
              Use fallback sample portrait or upload from device:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={startCamera}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Camera
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 rounded-lg text-xs font-semibold border border-emerald-500/30 transition flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Photo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Preset avatar selector for quick demo testing */}
      {!photoUrl && (
        <div className="mt-3 pt-3 border-t border-slate-800/80">
          <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
            <Image className="w-3 h-3 text-emerald-400" />
            <span>Or Quick Select Demo Photo:</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {PRESET_AVATARS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onPhotoCaptured(preset.url)}
                className="group relative rounded-lg overflow-hidden border border-slate-700 hover:border-emerald-400 focus:outline-none transition aspect-square"
              >
                <img
                  src={preset.url}
                  alt={preset.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                />
                <div className="absolute inset-x-0 bottom-0 bg-black/70 py-0.5 text-[9px] text-slate-200 font-medium truncate px-1 text-center">
                  {preset.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
