import React, { useCallback, useState } from 'react';
import { UploadIcon } from './Icons';

interface UploaderProps {
  onImageSelected: (base64: string, mimeType: string, previewUrl: string) => void;
  isLoading: boolean;
  onError: (message: string) => void;
}

export const Uploader: React.FC<UploaderProps> = ({ onImageSelected, isLoading, onError }) => {
  const [dragActive, setDragActive] = useState(false);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      onError('Invalid file type. Please upload an image file (PNG, JPG, SVG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // Extract base64 part only for the API
      const base64Data = result.split(',')[1];
      const mimeType = file.type;
      
      onImageSelected(base64Data, mimeType, result);
    };
    reader.onerror = () => {
        onError("Failed to read the file. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <label
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative flex flex-col items-center justify-center w-full h-64 
          border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300
          ${dragActive 
            ? 'border-red-500 bg-red-500/10' 
            : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-slate-500'}
          ${isLoading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {isLoading ? (
                <div className="flex flex-col items-center">
                    <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-sm text-slate-400">Analyzing stickers...</p>
                </div>
            ) : (
                <>
                    <UploadIcon />
                    <p className="mb-2 text-sm text-slate-300 font-medium">
                        <span className="font-semibold text-red-400">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-slate-500">SVG, PNG, JPG (Sticker Designs)</p>
                </>
            )}
        </div>
        <input 
            type="file" 
            className="hidden" 
            accept="image/*" 
            onChange={handleChange}
            disabled={isLoading}
        />
      </label>
    </div>
  );
};
