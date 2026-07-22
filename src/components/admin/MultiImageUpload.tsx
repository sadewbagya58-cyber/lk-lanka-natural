'use client';

import { useState, useRef } from 'react';
import { UploadCloud, X, Loader2, Star, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import Image from 'next/image';

export interface MultiImageItem {
  id?: string;
  url: string;
  isPrimary: boolean;
}

interface MultiImageUploadProps {
  value: MultiImageItem[];
  onChange: (items: MultiImageItem[]) => void;
  folder?: string;
  label?: string;
  maxImages?: number;
}

export default function MultiImageUpload({
  value = [],
  onChange,
  folder = 'products',
  label = 'Product Image Gallery',
  maxImages = 10,
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (value.length + files.length > maxImages) {
      setError(`You can only upload a maximum of ${maxImages} images.`);
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const uploadedItems: MultiImageItem[] = [...value];

      for (const file of files) {
        // Client side checks
        const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
        if (!validMimeTypes.includes(file.type)) {
          throw new Error(`Invalid format for ${file.name}. Allowed: JPG, PNG, WEBP, GIF, SVG`);
        }

        const MAX_SIZE = 5 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
          throw new Error(`File ${file.name} exceeds the 5MB size limit.`);
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || `Failed to upload ${file.name}`);
        }

        // Add to uploaded array
        uploadedItems.push({
          url: data.url,
          isPrimary: uploadedItems.length === 0, // default first one to primary
        });
      }

      // If there were already items but none were primary, make the first one primary
      const hasPrimary = uploadedItems.some((item) => item.isPrimary);
      if (!hasPrimary && uploadedItems.length > 0) {
        uploadedItems[0].isPrimary = true;
      }

      onChange(uploadedItems);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const setPrimary = (index: number) => {
    const updated = value.map((item, idx) => ({
      ...item,
      isPrimary: idx === index,
    }));
    onChange(updated);
  };

  const removeImage = (index: number) => {
    const wasPrimary = value[index].isPrimary;
    let updated = value.filter((_, idx) => idx !== index);

    // If we removed the primary image, make the new first image primary
    if (wasPrimary && updated.length > 0) {
      updated = updated.map((item, idx) => ({
        ...item,
        isPrimary: idx === 0,
      }));
    }
    onChange(updated);
  };

  const moveItem = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= value.length) return;

    const updated = [...value];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Preserve first as primary if there was no primary or just general safety
    onChange(updated);
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {label && (
        <div className="flex justify-between items-center">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
            {label} ({value.length}/{maxImages})
          </label>
          <span className="text-[10px] text-slate-400 font-bold">Max 5MB per image</span>
        </div>
      )}

      {/* Hidden File Input (supports multiple select) */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        onChange={handleFilesChange}
        className="hidden"
        disabled={value.length >= maxImages || uploading}
      />

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs font-bold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Image Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {value.map((item, index) => (
          <div
            key={item.id || item.url || index}
            className={`relative rounded-2xl border-2 overflow-hidden flex flex-col justify-between group transition-all h-44 bg-white ${
              item.isPrimary ? 'border-emerald-600 shadow-md shadow-emerald-50' : 'border-slate-100 hover:border-slate-200'
            }`}
          >
            {/* Image Preview */}
            <div className="relative flex-grow flex items-center justify-center p-2 bg-slate-50">
              <Image
                src={item.url}
                alt={`Preview ${index + 1}`}
                fill
                className="object-contain p-1.5"
                unoptimized
              />

              {/* Badges Overlay */}
              <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 pointer-events-none">
                {item.isPrimary ? (
                  <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded shadow">
                    Main Image
                  </span>
                ) : (
                  <span className="text-[9px] font-black uppercase tracking-wider bg-slate-800/80 text-white px-2 py-0.5 rounded shadow">
                    #{index + 1}
                  </span>
                )}
              </div>

              {/* Action Overlay */}
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="p-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition-colors shadow"
                  title="Delete image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Bottom Actions Panel */}
            <div className="bg-slate-50 border-t border-slate-100 p-1.5 flex items-center justify-between gap-1">
              {/* Move Left */}
              <button
                type="button"
                onClick={() => moveItem(index, 'left')}
                disabled={index === 0}
                className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 hover:bg-slate-200 rounded-md transition-colors"
                title="Move Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Set Primary Toggle */}
              {!item.isPrimary ? (
                <button
                  type="button"
                  onClick={() => setPrimary(index)}
                  className="flex-1 py-1 text-[10px] font-bold text-slate-500 hover:text-emerald-600 flex items-center justify-center gap-1 hover:bg-slate-200 rounded-md transition-colors"
                  title="Make Primary"
                >
                  <Star className="w-3 h-3 text-slate-400" />
                  <span>Main</span>
                </button>
              ) : (
                <span className="flex-1 text-center py-1 text-[10px] font-bold text-emerald-600 flex items-center justify-center gap-1">
                  <Star className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                  <span>Main</span>
                </span>
              )}

              {/* Move Right */}
              <button
                type="button"
                onClick={() => moveItem(index, 'right')}
                disabled={index === value.length - 1}
                className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 hover:bg-slate-200 rounded-md transition-colors"
                title="Move Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {/* Upload Button Box */}
        {value.length < maxImages && (
          <button
            type="button"
            onClick={() => !uploading && fileInputRef.current?.click()}
            disabled={uploading}
            className={`border-2 border-dashed rounded-2xl h-44 p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
              uploading
                ? 'bg-slate-50 border-slate-300 cursor-not-allowed text-slate-400'
                : 'border-slate-250 hover:border-emerald-500 hover:bg-emerald-50/10 text-slate-500 hover:text-slate-800'
            }`}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2 text-emerald-600 text-center">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-[10px] font-bold">Uploading...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 text-center">
                <UploadCloud className="w-7 h-7 text-emerald-600" />
                <span className="text-xs font-bold">Add Images</span>
                <span className="text-[9px] text-slate-450 leading-tight">
                  JPG, PNG, WEBP, GIF, SVG
                </span>
              </div>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
