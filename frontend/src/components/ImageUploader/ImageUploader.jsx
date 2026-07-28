import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Camera, CheckCircle, AlertCircle, Loader, ZoomIn } from 'lucide-react';

const SUPPORTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
const MAX_FILES = 5;

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ImageUploader({ onFilesSelected, onClear, selectedFiles = [], disabled = false }) {
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState([]);
  const [previewModal, setPreviewModal] = useState(null);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (!SUPPORTED_FORMATS.includes(file.type)) {
      return `"${file.name}" — unsupported format. Use JPG, JPEG, PNG, or WEBP.`;
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `"${file.name}" — ${formatBytes(file.size)} exceeds the 20 MB limit.`;
    }
    return null;
  };

  const processFiles = useCallback((fileList) => {
    const files = Array.from(fileList);
    const newErrors = [];
    const validFiles = [];

    if (selectedFiles.length + files.length > MAX_FILES) {
      newErrors.push(`You can upload a maximum of ${MAX_FILES} images at once.`);
    }

    files.slice(0, MAX_FILES - selectedFiles.length).forEach((file) => {
      const error = validateFile(file);
      if (error) {
        newErrors.push(error);
      } else {
        const url = URL.createObjectURL(file);
        validFiles.push({ file, previewUrl: url, id: `${file.name}-${Date.now()}-${Math.random()}` });
      }
    });

    setErrors(newErrors);
    if (validFiles.length > 0 && onFilesSelected) {
      onFilesSelected([...selectedFiles, ...validFiles]);
    }
  }, [selectedFiles, onFilesSelected]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled) processFiles(e.dataTransfer.files);
  }, [disabled, processFiles]);

  const handleDragOver = (e) => { e.preventDefault(); if (!disabled) setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const removeFile = (id) => {
    const updated = selectedFiles.filter((f) => f.id !== id);
    if (onFilesSelected) onFilesSelected(updated);
    if (updated.length === 0 && onClear) onClear();
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer
          transition-all duration-300 group select-none
          ${isDragging
            ? 'border-primary-500 bg-primary-50/30 dark:bg-emerald-950/20 scale-[1.01]'
            : 'border-borderLight dark:border-borderDark hover:border-primary-400 dark:hover:border-primary-500'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${selectedFiles.length === 0 ? 'min-h-52' : 'min-h-32'}
        `}
      >
        {/* Animated background on drag */}
        {isDragging && (
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary-500/5 to-emerald-500/5 animate-pulse pointer-events-none" />
        )}

        <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
          <div className={`
            w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300
            ${isDragging
              ? 'bg-primary-500/20 text-primary-500 scale-110'
              : 'bg-slate-100 dark:bg-cardDark text-slate-400 dark:text-slate-500 group-hover:bg-primary-50 dark:group-hover:bg-emerald-950/20 group-hover:text-primary-500'
            }
          `}>
            {isDragging ? (
              <CheckCircle size={28} className="animate-bounce" />
            ) : (
              <Upload size={28} />
            )}
          </div>

          {isDragging ? (
            <p className="text-sm font-semibold text-primary-600 dark:text-primary-neon">Drop your images here!</p>
          ) : (
            <>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Drag & drop textile images here
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                or <span className="text-primary-600 dark:text-primary-neon font-semibold">click to browse</span>
              </p>
              <p className="text-[10px] text-slate-300 dark:text-slate-600 font-mono mt-1">
                JPG · JPEG · PNG · WEBP &nbsp;|&nbsp; Max 20 MB · Up to {MAX_FILES} images
              </p>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {/* Camera Upload Placeholder */}
      <button
        type="button"
        className="w-full flex items-center justify-center space-x-2 py-2.5 border border-dashed border-slate-200 dark:border-borderDark rounded-2xl text-xs text-slate-400 dark:text-slate-500 hover:border-primary-300 dark:hover:border-primary-700 hover:text-primary-500 transition-all"
        onClick={() => alert('Camera capture will be available in a future release.')}
      >
        <Camera size={14} />
        <span>Camera Capture (Coming Soon)</span>
      </button>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="space-y-1.5">
          {errors.map((err, i) => (
            <div key={i} className="flex items-start space-x-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl px-3 py-2">
              <AlertCircle size={13} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-red-600 dark:text-red-400 leading-snug">{err}</p>
            </div>
          ))}
        </div>
      )}

      {/* Image Previews */}
      {selectedFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {selectedFiles.map((item) => (
            <div
              key={item.id}
              className="relative group rounded-2xl overflow-hidden border border-borderLight dark:border-borderDark bg-slate-50 dark:bg-cardDark shadow-soft aspect-square"
            >
              <img
                src={item.previewUrl}
                alt={item.file.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 flex space-x-2 transition-opacity duration-200">
                  <button
                    onClick={(e) => { e.stopPropagation(); setPreviewModal(item); }}
                    className="p-1.5 bg-white/90 rounded-lg text-slate-700 hover:bg-white"
                  >
                    <ZoomIn size={13} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(item.id); }}
                    className="p-1.5 bg-white/90 rounded-lg text-red-500 hover:bg-white"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>

              {/* File info */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <p className="text-white text-[9px] truncate font-medium">{item.file.name}</p>
                <p className="text-white/70 text-[8px] font-mono">{formatBytes(item.file.size)}</p>
              </div>
            </div>
          ))}

          {/* Add more */}
          {selectedFiles.length < MAX_FILES && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-2xl border-2 border-dashed border-borderLight dark:border-borderDark flex flex-col items-center justify-center text-slate-400 hover:border-primary-400 hover:text-primary-500 transition-all group"
            >
              <ImageIcon size={20} className="group-hover:scale-110 transition-transform" />
              <span className="text-[9px] mt-1 font-medium">Add More</span>
            </button>
          )}
        </div>
      )}

      {/* Preview Modal */}
      {previewModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setPreviewModal(null)}
        >
          <div
            className="relative max-w-3xl max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={previewModal.previewUrl} alt={previewModal.file.name} className="max-w-full max-h-[80vh] object-contain" />
            <button
              onClick={() => setPreviewModal(null)}
              className="absolute top-3 right-3 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
            >
              <X size={16} />
            </button>
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <p className="text-white text-sm font-semibold">{previewModal.file.name}</p>
              <p className="text-white/60 text-xs">{formatBytes(previewModal.file.size)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
