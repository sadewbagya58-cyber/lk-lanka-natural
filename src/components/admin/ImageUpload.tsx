'use client';

import { useState, useRef } from 'react';
import { UploadCloud, X, Loader2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  placeholder?: string;
}

export default function ImageUpload({
  value,
  onChange,
  folder = 'general',
  label = 'Image Upload',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      onChange(data.url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    onChange('');
    setError(null);
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
          {label}
        </label>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        /* Image Preview Box */
        <div className="relative w-full h-40 bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden group flex items-center justify-center">
          <Image
            src={value}
            alt="Uploaded Preview"
            fill
            className="object-contain p-2"
            unoptimized
          />
          
          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white text-slate-900 rounded-xl text-xs font-bold shadow-md hover:bg-slate-100 transition-colors"
            >
              Change
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-rose-700 transition-colors"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Dropzone Box */
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`w-full h-36 border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
            uploading
              ? 'bg-slate-50 border-slate-300 cursor-not-allowed'
              : 'border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-emerald-600">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-xs font-bold">Uploading to Hostinger Storage...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <UploadCloud className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">
                Click or drag image to upload
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                JPG, PNG, WEBP, GIF or SVG (Max 5MB)
              </span>
            </div>
          )}
        </div>
      )}

      {error && (
        <span className="text-xs font-bold text-rose-600 flex items-center gap-1 mt-0.5">
          <ImageIcon className="w-3.5 h-3.5" />
          {error}
        </span>
      )}
    </div>
  );
}
