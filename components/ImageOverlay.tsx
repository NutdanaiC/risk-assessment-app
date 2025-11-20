import React, { useState } from 'react';
import { Eye, EyeOff, AlertTriangle, ChevronLeft, ChevronRight, X, Info } from 'lucide-react';
import { RiskItem, Severity } from '../types';

interface ImageOverlayProps {
  imageUrl: string;
  risks: RiskItem[];
  className?: string;
  highlightedRiskId?: string | null;
  onSelectRisk?: (id: string | null) => void;
}

export const ImageOverlay: React.FC<ImageOverlayProps> = ({ 
  imageUrl, 
  risks, 
  className = '', 
  highlightedRiskId,
  onSelectRisk
}) => {
  const [showOverlay, setShowOverlay] = useState(true);
  const [internalHoverId, setInternalHoverId] = useState<string | null>(null);

  // Filter risks that have spatial data
  const mappedRisks = risks.filter(r => (r.polygon && r.polygon.length > 0) || (r.boundingBox && r.boundingBox.length === 4));
  
  // Find index of currently selected risk
  const activeIndex = highlightedRiskId 
    ? mappedRisks.findIndex(r => r.id === highlightedRiskId)
    : -1;

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mappedRisks.length === 0) return;
    const nextIndex = activeIndex === -1 ? 0 : (activeIndex + 1) % mappedRisks.length;
    onSelectRisk?.(mappedRisks[nextIndex].id);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mappedRisks.length === 0) return;
    const prevIndex = activeIndex === -1 
      ? mappedRisks.length - 1 
      : (activeIndex - 1 + mappedRisks.length) % mappedRisks.length;
    onSelectRisk?.(mappedRisks[prevIndex].id);
  };

  const handleCloseDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectRisk?.(null);
  };

  const getSeverityColors = (severity: Severity) => {
    switch (severity) {
      case Severity.CRITICAL:
        return { fill: 'rgba(239, 68, 68, 0.3)', stroke: '#ef4444', text: 'bg-red-600', border: 'border-red-500' };
      case Severity.HIGH:
        return { fill: 'rgba(249, 115, 22, 0.3)', stroke: '#f97316', text: 'bg-orange-600', border: 'border-orange-500' };
      case Severity.MEDIUM:
        return { fill: 'rgba(234, 179, 8, 0.3)', stroke: '#eab308', text: 'bg-yellow-600', border: 'border-yellow-500' };
      case Severity.LOW:
        return { fill: 'rgba(16, 185, 129, 0.3)', stroke: '#10b981', text: 'bg-emerald-600', border: 'border-emerald-500' };
      default:
        return { fill: 'rgba(59, 130, 246, 0.3)', stroke: '#3b82f6', text: 'bg-blue-600', border: 'border-blue-500' };
    }
  };

  return (
    <div 
      className={`relative bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-slate-800 group ${className}`}
      onClick={() => onSelectRisk?.(null)}
    >
      
      {/* Main Image */}
      <img 
        src={imageUrl} 
        alt="Analyzed Environment" 
        className="w-full h-auto block select-none"
      />

      {/* Overlay Container */}
      {showOverlay && (
        <>
          {/* 1. SVG Layer: Masks & Boxes */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 1000 1000" 
            preserveAspectRatio="none"
          >
            {mappedRisks.map((risk) => {
              const isSelected = highlightedRiskId === risk.id;
              const isHovered = internalHoverId === risk.id;
              const isDimmed = highlightedRiskId && !isSelected;
              const colors = getSeverityColors(risk.severity);

              const opacity = isDimmed ? 0.15 : (isSelected || isHovered ? 1 : 0.8);

              return (
                <g 
                  key={risk.id}
                  className="pointer-events-auto cursor-pointer transition-all duration-300"
                  onMouseEnter={() => setInternalHoverId(risk.id)}
                  onMouseLeave={() => setInternalHoverId(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectRisk?.(risk.id);
                  }}
                  style={{ opacity }}
                >
                  {/* Segmentation Polygon (Filled) */}
                  {risk.polygon && risk.polygon.length > 2 && (
                    <polygon
                      points={risk.polygon.map(p => `${p.x},${p.y}`).join(' ')}
                      fill={colors.fill}
                      stroke="none"
                    />
                  )}

                  {/* Bounding Box (Dashed) */}
                  {risk.boundingBox && (
                     <rect
                        x={risk.boundingBox[1]}
                        y={risk.boundingBox[0]}
                        width={risk.boundingBox[3] - risk.boundingBox[1]}
                        height={risk.boundingBox[2] - risk.boundingBox[0]}
                        fill="none"
                        stroke={colors.stroke}
                        strokeWidth={isSelected ? 3 : 2}
                        strokeDasharray="6 4" // Dashed line effect
                        vectorEffect="non-scaling-stroke"
                      />
                  )}
                </g>
              );
            })}
          </svg>

          {/* 2. HTML Layer: Labels & Badges (Positioned absolutely) */}
          {mappedRisks.map((risk) => {
             const isSelected = highlightedRiskId === risk.id;
             const isDimmed = highlightedRiskId && !isSelected;
             if (isDimmed) return null; // Hide labels for dimmed items to reduce clutter

             const colors = getSeverityColors(risk.severity);
             
             // Calculate position (Top-Left of the bounding box)
             let top = 0;
             let left = 0;
             
             if (risk.boundingBox) {
               top = (risk.boundingBox[0] / 1000) * 100;
               left = (risk.boundingBox[1] / 1000) * 100;
             } else if (risk.polygon && risk.polygon.length > 0) {
               top = (risk.polygon[0].y / 1000) * 100;
               left = (risk.polygon[0].x / 1000) * 100;
             }

             return (
               <div 
                 key={`label-${risk.id}`}
                 className="absolute pointer-events-none z-10 flex items-start gap-1"
                 style={{ 
                   top: `${top}%`, 
                   left: `${left}%`,
                   transform: 'translate(0, -110%)' // Move slightly above the box
                 }}
               >
                 {/* Number Badge */}
                 <div className={`
                   ${colors.text} text-white font-bold text-xs h-5 w-5 flex items-center justify-center rounded shadow-sm
                 `}>
                   {risk.id}
                 </div>
                 
                 {/* Text Label */}
                 <div className="bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded font-medium whitespace-nowrap shadow-sm">
                   {risk.title}
                 </div>
               </div>
             );
          })}
        </>
      )}

      {/* Floating Interface Layer (Bottom Panel) */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
        
        {/* Top Control Bar */}
        <div className="flex justify-between items-start pointer-events-auto">
           <div className="bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-medium border border-white/10 flex items-center gap-2 shadow-lg">
              <AlertTriangle className="h-3 w-3 text-orange-400" />
              <span>{mappedRisks.length} Findings</span>
           </div>
           <button 
             onClick={(e) => { e.stopPropagation(); setShowOverlay(!showOverlay); }}
             className="bg-black/60 backdrop-blur-md text-white p-2 rounded-full hover:bg-black/80 transition-colors border border-white/10 shadow-lg"
             title={showOverlay ? "Hide Overlay" : "Show Overlay"}
           >
             {showOverlay ? <Eye size={18} /> : <EyeOff size={18} />}
           </button>
        </div>

        {/* Carousel Navigation (Only if active selection) */}
        {highlightedRiskId && mappedRisks.length > 1 && (
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex justify-between px-2 pointer-events-none">
            <button 
              onClick={handlePrev}
              className="pointer-events-auto p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition-all border border-white/10 hover:scale-110 hover:border-white/30 shadow-xl"
              title="Previous Finding"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={handleNext}
              className="pointer-events-auto p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition-all border border-white/10 hover:scale-110 hover:border-white/30 shadow-xl"
              title="Next Finding"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}

        {/* Bottom Details Panel */}
        <div className="pointer-events-auto flex justify-center items-end pb-1">
           {highlightedRiskId ? (
             // Active Finding Details Card
             (() => {
               const activeRisk = mappedRisks.find(r => r.id === highlightedRiskId);
               if (!activeRisk) return null;
               const colors = getSeverityColors(activeRisk.severity);

               return (
                 <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-md rounded-xl border border-white/10 p-4 text-white shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                   <div className="flex justify-between items-start mb-2">
                     <div className="flex items-center gap-2">
                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${colors.text} text-white shadow-sm`}>
                         {activeRisk.severity}
                       </span>
                       <span className="text-slate-400 text-xs font-mono bg-black/30 px-1.5 py-0.5 rounded">
                         {activeIndex + 1} / {mappedRisks.length}
                       </span>
                     </div>
                     <button onClick={handleCloseDetails} className="text-slate-400 hover:text-white transition-colors bg-white/5 p-1 rounded-full hover:bg-white/10">
                       <X size={14} />
                     </button>
                   </div>
                   
                   <h3 className="font-bold text-lg leading-tight mb-1 pr-2">{activeRisk.title}</h3>
                   <p className="text-sm text-slate-300 line-clamp-2 mb-3 leading-relaxed">{activeRisk.description}</p>
                   
                   <div className="flex items-center justify-between pt-3 border-t border-white/10">
                     <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-500 uppercase font-semibold">Confidence</span>
                          <span className="text-sm font-bold text-emerald-400">{activeRisk.confidence}%</span>
                        </div>
                        <div className="w-px h-6 bg-white/10"></div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-500 uppercase font-semibold">ID</span>
                          <span className="text-sm font-mono text-slate-300">#{activeRisk.id}</span>
                        </div>
                     </div>
                     <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium flex items-center gap-1">
                       Next <ChevronRight size={10} />
                     </div>
                   </div>
                 </div>
               );
             })()
           ) : (
             // Overview / Helper Pill
             mappedRisks.length > 0 && showOverlay && (
                <div className="bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm border border-white/10 shadow-lg flex items-center gap-2 animate-pulse">
                   <Info size={16} className="text-blue-400"/>
                   <span>Select a highlighted area to view details</span>
                </div>
             )
           )}
           
           {/* Empty State */}
           {mappedRisks.length === 0 && (
             <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
               <AlertTriangle className="h-4 w-4 text-yellow-500" />
               <span className="text-xs text-slate-300">No findings detected</span>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};