import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, CheckCircle2, AlertCircle, RefreshCw, X, FileImage } from 'lucide-react';
import { compressImage, uploadImageToStorage } from '../utils/imageUpload';

interface ImageUploaderProps {
  currentImageUrl: string;
  onImageUploaded: (url: string) => void;
  sampleImages?: { label: string; url: string }[];
  typeTheme?: 'amber' | 'blue';
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  currentImageUrl,
  onImageUploaded,
  sampleImages,
  typeTheme = 'blue',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const themeAccent = typeTheme === 'amber' ? 'amber' : 'blue';

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    setUploadError(null);
    setIsCompressing(true);
    setUploadProgress(0);

    try {
      // 1. Compress image client-side
      const compressedBlob = await compressImage(file, 1200, 0.8);
      setIsCompressing(false);

      // 2. Upload to Firebase Storage with live progress
      setIsUploading(true);
      const downloadUrl = await uploadImageToStorage(
        compressedBlob,
        'item-photos',
        (progress) => {
          setUploadProgress(progress);
        }
      );

      // 3. Callback with download URL
      onImageUploaded(downloadUrl);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setUploadError(err.message || 'Failed to upload image to Firebase Storage.');
    } finally {
      setIsCompressing(false);
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Item Photo (Upload or Select Template)
        </label>
        {currentImageUrl && !isUploading && (
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Photo Attached
          </span>
        )}
      </div>

      {/* Main Upload Dropzone Container */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-4 transition-all ${
          dragActive
            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Preview Thumbnail */}
          <div className="relative w-28 h-28 rounded-2xl bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-300 dark:border-slate-600 shrink-0 group">
            {currentImageUrl ? (
              <img
                src={currentImageUrl}
                alt="Uploaded preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                <ImageIcon className="w-8 h-8 mb-1" />
                <span className="text-[10px]">No image selected</span>
              </div>
            )}
            
            {currentImageUrl && !isUploading && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-semibold"
              >
                <RefreshCw className="w-4 h-4 mb-1" />
                <span>Change</span>
              </button>
            )}
          </div>

          {/* Interactive Upload Controls & Progress */}
          <div className="flex-1 space-y-3 text-center sm:text-left w-full">
            {/* Compressing status */}
            {isCompressing && (
              <div className="space-y-1.5 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-300">
                  <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
                  <span>Compressing image file...</span>
                </div>
                <p className="text-[11px] text-blue-600 dark:text-blue-400">
                  Optimizing dimensions & quality for fast campus network display
                </p>
              </div>
            )}

            {/* Uploading Progress Status */}
            {isUploading && (
              <div className="space-y-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                  <span className="flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 animate-bounce" />
                    Uploading to Firebase Storage...
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-emerald-200 dark:bg-emerald-900 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Default Drag/Click instructions */}
            {!isCompressing && !isUploading && (
              <div className="space-y-2">
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  Drag and drop a photo here, or browse files from your device
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition-all inline-flex items-center gap-1.5 ${
                    typeTheme === 'amber'
                      ? 'bg-amber-500 hover:bg-amber-600'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" /> Select Local Image
                </button>
              </div>
            )}

            {/* Error Message */}
            {uploadError && (
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preset Sample Templates Selection */}
      {sampleImages && sampleImages.length > 0 && (
        <div className="space-y-2 pt-1">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Or choose a campus preset sample photo template:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {sampleImages.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => onImageUploaded(s.url)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                  currentImageUrl === s.url
                    ? typeTheme === 'amber'
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
