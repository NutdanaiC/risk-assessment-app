import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Thermometer, 
  Zap, 
  HardHat, 
  Droplets, 
  Activity, 
  Construction, 
  HelpCircle, 
  AlertOctagon,
  ChevronDown,
  ChevronUp,
  ScanEye,
  Download,
  Loader2,
  SlidersHorizontal
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { AssessmentResult, RiskCategory, Severity, RiskItem, ImageFile } from '../types';
import { SeverityBadge } from './SeverityBadge';
import { CategoryChart, SeverityDonut } from './Charts';
import { ImageOverlay } from './ImageOverlay';

interface ReportViewProps {
  result: AssessmentResult;
  images: ImageFile[];
  onReset: () => void;
}

const getCategoryIcon = (category: RiskCategory) => {
  switch (category) {
    case RiskCategory.ELECTRICAL: return <Zap className="h-5 w-5" />;
    case RiskCategory.FIRE: return <Thermometer className="h-5 w-5" />;
    case RiskCategory.STRUCTURAL: return <Construction className="h-5 w-5" />;
    case RiskCategory.CHEMICAL: return <AlertOctagon className="h-5 w-5" />;
    case RiskCategory.ENVIRONMENTAL: return <Droplets className="h-5 w-5" />;
    case RiskCategory.TRIP_FALL: return <Activity className="h-5 w-5" />;
    case RiskCategory.WORKPLACE: return <HardHat className="h-5 w-5" />;
    default: return <HelpCircle className="h-5 w-5" />;
  }
};

interface RiskCardProps {
  risk: RiskItem;
  isActive: boolean;
  onToggle: (id: string) => void;
}

const RiskCard: React.FC<RiskCardProps> = ({ risk, isActive, onToggle }) => {
  return (
    <div 
      className={`bg-white border rounded-lg p-4 transition-all break-inside-avoid cursor-pointer
        ${isActive ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-slate-200 hover:shadow-md hover:border-blue-200'}
      `}
      onClick={() => onToggle(risk.id)}
    >
      <div className="flex items-start justify-between">
        <div className="flex gap-3 items-center">
          {/* ID Badge */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-full font-bold flex items-center justify-center border text-sm transition-colors
            ${isActive ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 text-slate-600 border-slate-200'}
          `}>
            {risk.id}
          </div>
          
          <div className={`p-2 rounded-lg ${
            risk.severity === Severity.CRITICAL ? 'bg-red-100 text-red-600' :
            risk.severity === Severity.HIGH ? 'bg-orange-100 text-orange-600' :
            risk.severity === Severity.MEDIUM ? 'bg-yellow-100 text-yellow-600' :
            'bg-emerald-100 text-emerald-600'
          }`}>
            {getCategoryIcon(risk.category)}
          </div>
          <div>
            <h4 className="font-medium text-slate-900 flex items-center gap-2">
              {risk.title}
              <SeverityBadge level={risk.severity} />
            </h4>
            <p className="text-sm text-slate-500 mt-1 line-clamp-2">{risk.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-medium text-slate-500">Confidence</span>
              <span className="text-sm font-bold text-slate-700">{risk.confidence}%</span>
           </div>
           <button className="text-slate-400">
             {isActive ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
           </button>
        </div>
      </div>
      
      {isActive && (
        <div className="mt-4 pt-4 border-t border-slate-100 pl-[4.5rem] animate-fade-in">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Analysis</h5>
              <p className="text-sm text-slate-700">{risk.description}</p>
              {risk.locationInImage && (
                 <p className="text-xs text-slate-500 mt-2">
                   <span className="font-medium">Location:</span> {risk.locationInImage}
                 </p>
              )}
            </div>
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <h5 className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Mitigation Strategy
              </h5>
              <p className="text-sm text-blue-900">{risk.mitigation}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const ReportView: React.FC<ReportViewProps> = ({ result, images, onReset }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [activeRiskId, setActiveRiskId] = useState<string | null>(null);
  const [minConfidence, setMinConfidence] = useState(0);

  const scoreColor = 
    result.overallScore < 30 ? 'text-emerald-600' : 
    result.overallScore < 60 ? 'text-yellow-600' : 
    result.overallScore < 85 ? 'text-orange-600' : 
    'text-red-600';

  const filteredRisks = result.risks.filter(r => r.confidence >= minConfidence);

  const handleRiskToggle = (id: string) => {
    setActiveRiskId(prev => prev === id ? null : id);
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15; 
      const contentWidth = pageWidth - (margin * 2);
      const contentHeight = pageHeight - (margin * 2);

      let currentY = margin;

      // --- 1. CAPTURE SUMMARY ---
      const summaryEl = document.getElementById('pdf-section-summary');
      if (summaryEl) {
        const canvas = await html2canvas(summaryEl, { 
          scale: 2, 
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff' 
        });
        const imgHeight = (canvas.height * contentWidth) / canvas.width;
        doc.addImage(canvas.toDataURL('image/png'), 'PNG', margin, currentY, contentWidth, imgHeight);
        currentY += imgHeight + 10; 
      }

      // --- 2. CAPTURE CHARTS ---
      const chartsEl = document.getElementById('pdf-section-charts');
      if (chartsEl) {
         const canvas = await html2canvas(chartsEl, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
         const imgHeight = (canvas.height * contentWidth) / canvas.width;
         
         if (currentY + imgHeight > pageHeight - margin) {
           doc.addPage();
           currentY = margin;
         }
         
         doc.addImage(canvas.toDataURL('image/png'), 'PNG', margin, currentY, contentWidth, imgHeight);
      }

      // --- 3. CAPTURE VISUALS ---
      const imageContainers = document.querySelectorAll('.pdf-image-container');
      
      for (let i = 0; i < imageContainers.length; i++) {
        const container = imageContainers[i] as HTMLElement;
        
        doc.addPage();
        doc.setFontSize(14);
        doc.setTextColor(40, 40, 40);
        doc.text(`Visual Analysis - Image ${i + 1}`, margin, margin + 8);
        
        const canvas = await html2canvas(container, { 
          scale: 3, 
          useCORS: true, 
          backgroundColor: '#ffffff' 
        });
        
        const maxImgHeight = pageHeight - (margin * 2) - 20; 
        let imgWidth = contentWidth;
        let imgHeight = (canvas.height * contentWidth) / canvas.width;

        if (imgHeight > maxImgHeight) {
           const scaleFactor = maxImgHeight / imgHeight;
           imgHeight = maxImgHeight;
           imgWidth = imgWidth * scaleFactor;
        }

        const xPos = margin + (contentWidth - imgWidth) / 2;
        const yPos = margin + 15;

        doc.addImage(canvas.toDataURL('image/png'), 'PNG', xPos, yPos, imgWidth, imgHeight);
      }

      // --- 4. CAPTURE FINDINGS ---
      const findingsEl = document.getElementById('pdf-section-findings');
      if (findingsEl) {
        doc.addPage();
        const canvas = await html2canvas(findingsEl, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = contentWidth;
        const totalCanvasHeightInMm = (canvas.height * contentWidth) / canvas.width;
        
        let heightLeft = totalCanvasHeightInMm;
        let pageY = margin;

        doc.addImage(imgData, 'PNG', margin, pageY, imgWidth, totalCanvasHeightInMm);
        heightLeft -= (contentHeight);

        while (heightLeft > 0) {
          doc.addPage();
          const printedHeight = totalCanvasHeightInMm - heightLeft;
          doc.addImage(imgData, 'PNG', margin, margin - printedHeight, imgWidth, totalCanvasHeightInMm);
          heightLeft -= contentHeight;
        }
      }

      const filename = `Risk_Assessment_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);

    } catch (error) {
      console.error("Failed to generate PDF", error);
      alert("Could not generate PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Control Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Assessment Report</h2>
          <p className="text-sm text-slate-500">Generated on {new Date(result.timestamp).toLocaleDateString()}</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
           <button 
            onClick={onReset}
            disabled={isExporting}
            className="flex-1 md:flex-none px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
          >
            New Assessment
          </button>
          <button 
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex-1 md:flex-none px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isExporting ? 'Generating PDF...' : 'Export PDF'}
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 space-y-8">
        
        {/* Summary Section */}
        <div id="pdf-section-summary" className="space-y-8">
          <div className="border-b border-slate-200 pb-6 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Safety Risk Assessment</h1>
              <p className="text-slate-500 mt-1">Automated Visual Inspection Report</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400 uppercase font-semibold">Risk Score</div>
              <div className={`text-4xl font-bold ${scoreColor}`}>{result.overallScore}/100</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">Executive Summary</h3>
              <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                {result.summary}
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 h-full">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">Key Actions</h3>
                <ul className="space-y-3">
                  {result.recommendedActions.slice(0, 4).map((action, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div id="pdf-section-charts" className="grid grid-cols-1 md:grid-cols-2 gap-6 break-inside-avoid">
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
            <h3 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wide">Risks by Category</h3>
            <CategoryChart result={result} />
          </div>
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
            <h3 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wide">Severity Distribution</h3>
            <SeverityDonut result={result} />
          </div>
        </div>

        {/* Visual Analysis Section */}
        <div id="pdf-section-visuals" className="space-y-6 break-inside-avoid">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <ScanEye className="h-5 w-5 text-slate-400" />
            Visual Analysis & Segmentation
          </h3>
          <div className="grid grid-cols-1 gap-12">
            {images.map((img, index) => {
               const imageRisks = filteredRisks.filter(r => (r.imageIndex ?? 0) === index);
               return (
                 <div key={img.id} className="pdf-image-container space-y-3">
                   <div className="flex justify-between items-center">
                     <h4 className="text-sm font-semibold text-slate-600">Figure {index + 1}: Detected Hazards Overlay</h4>
                     <span className="text-xs text-slate-400 italic">Click findings below to highlight in image</span>
                   </div>
                   <ImageOverlay 
                      imageUrl={img.previewUrl} 
                      risks={imageRisks} 
                      highlightedRiskId={activeRiskId}
                      onSelectRisk={setActiveRiskId}
                      className="border-2 border-slate-200"
                    />
                 </div>
               );
            })}
          </div>
        </div>

        {/* Findings Section */}
        <div id="pdf-section-findings" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 border-b border-slate-100 pb-2">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-slate-400" />
              Detailed Risk Findings ({filteredRisks.length})
            </h3>
            
            {/* Confidence Filter */}
            <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
               <SlidersHorizontal className="h-4 w-4 text-slate-400" />
               <span className="text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">Min Confidence:</span>
               <input 
                 type="range" 
                 min="0" 
                 max="100" 
                 step="5"
                 value={minConfidence} 
                 onChange={(e) => setMinConfidence(Number(e.target.value))}
                 className="h-2 w-24 sm:w-32 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
               />
               <span className="text-sm font-bold text-slate-700 w-9 text-right">{minConfidence}%</span>
            </div>
          </div>
          
          {filteredRisks.length === 0 ? (
             <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
               {result.risks.length > 0 ? (
                 <>
                    <SlidersHorizontal className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500">No risks match the selected confidence level.</p>
                    <button onClick={() => setMinConfidence(0)} className="text-blue-600 text-sm font-medium mt-2 hover:underline">Reset Filter</button>
                 </>
               ) : (
                 <>
                    <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-2" />
                    <p className="text-slate-500">No significant risks detected.</p>
                 </>
               )}
             </div>
          ) : (
            <div className="grid gap-4">
              {filteredRisks
                .sort((a, b) => {
                   // Try to sort by ID if they are numeric strings
                   const idA = parseInt(a.id);
                   const idB = parseInt(b.id);
                   if (!isNaN(idA) && !isNaN(idB)) {
                     return idA - idB;
                   }
                   return 0;
                })
                .map((risk) => (
                <RiskCard 
                  key={risk.id} 
                  risk={risk} 
                  isActive={activeRiskId === risk.id}
                  onToggle={handleRiskToggle}
                />
              ))}
            </div>
          )}
        </div>

        <div className="pt-8 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-400">
            Generated by Sentinel AI Risk Assessment Platform. 
            This report is computer-generated and should be verified by a certified safety professional.
          </p>
        </div>

      </div>
    </div>
  );
};
