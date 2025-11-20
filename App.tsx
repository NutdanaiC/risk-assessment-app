import React, { useState } from 'react';
import { Header } from './components/Header';
import { UploadSection } from './components/UploadSection';
import { ReportView } from './components/ReportView';
import { ImageFile, AssessmentResult } from './types';
import { analyzeImages } from './services/geminiService';

const App: React.FC = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (images.length === 0) return;
    
    setIsAnalyzing(true);
    setError(null);

    try {
      const files = images.map(img => img.file);
      const assessment = await analyzeImages(files);
      setResult(assessment);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze images. Please try again or check your internet connection.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDemo = async () => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    setImages([]);

    try {
      // Fetch a sample construction site image
      // Using a specific Unsplash ID that shows a construction environment
      const response = await fetch('https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80');
      const blob = await response.blob();
      const file = new File([blob], "demo-construction-site.jpg", { type: blob.type });
      
      const demoImage: ImageFile = {
        id: 'demo-1',
        file,
        previewUrl: URL.createObjectURL(blob)
      };

      setImages([demoImage]);
      
      // Automatically trigger analysis for the demo
      const assessment = await analyzeImages([file]);
      setResult(assessment);
    } catch (err) {
      console.error(err);
      setError("Failed to load demo. Please try uploading your own image.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setImages([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {!result ? (
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                Instant AI Safety Risk Assessment
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Leverage computer vision to detect hazards in seconds. Upload photos of your workspace, construction site, or facility to get a detailed risk analysis report.
              </p>
            </div>
            
            <UploadSection 
              images={images}
              onImagesChange={setImages}
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
              onDemo={handleDemo}
            />

            {/* Feature Grid (Marketing placeholder for empty state) */}
            <div className="grid md:grid-cols-3 gap-8 pt-8 border-t border-slate-200">
               <div className="text-center">
                  <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                  </div>
                  <h3 className="font-semibold text-slate-900">Visual Recognition</h3>
                  <p className="text-sm text-slate-500 mt-2">Detects exposed wiring, spills, structural cracks, and PPE violations.</p>
               </div>
               <div className="text-center">
                  <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                  </div>
                  <h3 className="font-semibold text-slate-900">Risk Scoring</h3>
                  <p className="text-sm text-slate-500 mt-2">Calculates overall safety scores and categorizes risk severity automatically.</p>
               </div>
               <div className="text-center">
                  <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <h3 className="font-semibold text-slate-900">Actionable Advice</h3>
                  <p className="text-sm text-slate-500 mt-2">Provides specific mitigation strategies to resolve identified hazards.</p>
               </div>
            </div>
          </div>
        ) : (
          <ReportView result={result} onReset={handleReset} images={images} />
        )}
      </main>
    </div>
  );
};

export default App;