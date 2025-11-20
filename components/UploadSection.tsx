import React from 'react';
import { UploadCloud, X, Image as ImageIcon, ShieldAlert, Sparkles } from 'lucide-react';
import { ImageFile } from '../types';

interface UploadSectionProps {
  images: ImageFile[];
  onImagesChange: (images: ImageFile[]) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  onDemo: () => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  images,
  onImagesChange,
  onAnalyze,
  isAnalyzing,
  onDemo
}) => {
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file: File) => ({
        id: Math.random().toString(36).substring(7),
        file,
        previewUrl: URL.createObjectURL(file)
      }));
      onImagesChange([...images, ...newFiles]);
    }
  };

  const removeImage = (id: string) => {
    onImagesChange(images.filter(img => img.id !== id));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-slate-900">New Risk Assessment</h2>
        <p className="text-slate-500 mt-2">Upload photos of the environment to identify hazards and generate a safety report.</p>
      </div>

      {/* Drop Zone Visual */}
      <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 p-8 transition-all hover:border-blue-400 hover:bg-blue-50 flex flex-col items-center justify-center min-h-[200px]">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          disabled={isAnalyzing}
        />
        <div className="bg-white p-4 rounded-full shadow-sm mb-4">
          <UploadCloud className="h-8 w-8 text-blue-600" />
        </div>
        <p className="text-lg font-medium text-slate-700">Click or drag images here</p>
        <p className="text-sm text-slate-400 mt-1">Supports JPG, PNG, WEBP</p>
      </div>

      {/* Demo Link (Only show if no images selected) */}
      {images.length === 0 && (
        <div className="mt-6 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">Or</span>
            </div>
          </div>
          <button
            onClick={onDemo}
            disabled={isAnalyzing}
            className="mt-4 px-6 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all inline-flex items-center gap-2 shadow-sm"
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            Test Risk Assessment (Demo Image)
          </button>
        </div>
      )}

      {/* Preview Grid */}
      {images.length > 0 && (
        <div className="mt-8 animate-fade-in">
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Selected Images ({images.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((img) => (
              <div key={img.id} className="relative group aspect-video rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                <img src={img.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(img.id)}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                  disabled={isAnalyzing}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-8 flex justify-center">
            <button
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className={`
                px-8 py-3 rounded-lg font-semibold text-white shadow-lg shadow-blue-500/20
                transition-all flex items-center gap-2
                ${isAnalyzing 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0'
                }
              `}
            >
              {isAnalyzing ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing Scene...
                </>
              ) : (
                <>
                  <ShieldAlert className="h-5 w-5" />
                  Generate Risk Assessment
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};