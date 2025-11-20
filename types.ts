export enum Severity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum RiskCategory {
  WORKPLACE = 'WORKPLACE',
  STRUCTURAL = 'STRUCTURAL',
  ELECTRICAL = 'ELECTRICAL',
  FIRE = 'FIRE',
  CHEMICAL = 'CHEMICAL',
  ENVIRONMENTAL = 'ENVIRONMENTAL',
  ERGONOMIC = 'ERGONOMIC',
  TRIP_FALL = 'TRIP_FALL',
  OTHER = 'OTHER'
}

export interface RiskItem {
  id: string;
  title: string;
  description: string;
  category: RiskCategory;
  severity: Severity;
  confidence: number; // 0 to 100
  mitigation: string;
  locationInImage?: string;
  boundingBox?: number[]; // [ymin, xmin, ymax, xmax] 0-1000 scale
  polygon?: { x: number; y: number }[]; // Array of {x, y} coordinates on 0-1000 scale
  imageIndex?: number;
}

export interface AssessmentResult {
  overallRiskLevel: Severity;
  overallScore: number; // 0-100
  summary: string;
  timestamp: string;
  risks: RiskItem[];
  recommendedActions: string[];
}

export interface ImageFile {
  id: string;
  file: File;
  previewUrl: string;
}