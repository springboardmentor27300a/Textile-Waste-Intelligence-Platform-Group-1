export type UserRole = 
  | 'admin' 
  | 'operator' 
  | 'sustainability' 
  | 'manufacturer' 
  | 'manager' 
  | 'analyst' 
  | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  status: 'active' | 'inactive';
  joinedDate: string;
  lastLogin?: string;
}

export type BatchStatus = 'Collected' | 'Awaiting Analysis' | 'Analyzed' | 'Approved' | 'Processing' | 'Completed';

export interface WasteBatch {
  id: string; // e.g. BATCH-2026-089
  title: string;
  sourceFacility: string;
  materialType: string;
  weightKg: number;
  collectionDate: string;
  status: BatchStatus;
  location: string;
  assignedAnalyst?: string;
  itemsCount: number;
  notes?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export type WasteCategory = 
  | 'Recyclable' 
  | 'Reusable' 
  | 'Repairable' 
  | 'Upcyclable' 
  | 'Compostable' 
  | 'Hazardous Textile Waste';

export type ConditionGrade = 'Grade A (Pristine)' | 'Grade B (Minor Wear)' | 'Grade C (Moderate Damage)' | 'Grade D (Severe Contamination)';

export interface InventoryItem {
  id: string;
  batchId: string;
  materialName: string; // e.g. Post-Consumer Cotton Denim, Industrial Poly-Cotton Cut Offs
  fiberComposition: { fiber: string; percentage: number }[];
  quantityKg: number;
  category: WasteCategory;
  condition: ConditionGrade;
  contaminationLevel: 'None' | 'Low' | 'Medium' | 'High';
  recyclabilityScore: number; // 0-100
  storageLocation: string;
  sourceSupplier: string;
  receivedDate: string;
  status: 'Available' | 'Reserved' | 'In Processing' | 'Recycled' | 'Disposed';
  notes?: string;
}

export interface CircularityBreakdown {
  materialRecyclability: number; // 35% weight (0-35)
  materialCondition: number;     // 20% weight (0-20)
  reusePotential: number;        // 20% weight (0-20)
  environmentalBenefit: number;  // 15% weight (0-15)
  processingFeasibility: number; // 10% weight (0-10)
  overallScore: number;          // Weighted sum 0-100
  category?: 'Excellent Recovery Potential' | 'High Recovery Potential' | 'Moderate Recovery Potential' | 'Limited Recovery Potential' | 'Disposal Recommended';
  scores?: {
    recyclabilityScore: number;
    reuseScore: number;
    sustainabilityScore: number;
    materialRecoveryScore: number;
    carbonReductionScore: number;
    circularEconomyScore: number;
  };
}

export interface ResourceRecoveryEstimation {
  recoverableFibersKg: number;
  recoverablePolymersKg: number;
  waterSavedLiters: number;
  energySavedKwh: number;
  landfillAvoidedKg: number;
}

export interface CarbonFootprintEstimation {
  manufacturingCo2KgPerTon: number;
  savedCo2KgPerTon: number;
  netReductionPercent: number;
}

export interface EnvironmentalImpact {
  co2SavedKg: number;
  waterSavedLiters: number;
  energySavedKwh?: number;
  landfillAvoidedKg: number;
  materialRecoveryRate: number; // %
  pollutionReductionKg?: number; // dye/microfiber avoided
  resourceConservation?: {
    fibersSavedKg: number;
    virginPolymerAvoidedKg: number;
  };
  esgSdgAlignment?: {
    sdg12: string; // Responsible Consumption and Production
    sdg13: string; // Climate Action
    sdg6: string;  // Clean Water & Sanitation
    sdg9: string;  // Industry, Innovation & Infrastructure
  };
}

export type AIRecommendedAction = 
  | 'Direct Reuse'
  | 'Repair and Reuse'
  | 'Upcycling'
  | 'Mechanical Recycling'
  | 'Chemical Recycling'
  | 'Fiber Recovery'
  | 'Energy Recovery'
  | 'Safe Disposal';

export interface RecoveryStrategy {
  primaryAction?: AIRecommendedAction;
  primary: string; // e.g. "Mechanical Fiber Extraction & Garnetting"
  alternative: string; // e.g. "Industrial Wiper Manufacturing"
  rationale: string;
  processingMethod: string;
  expectedEfficiencyPercent: number;
  suggestedNextSteps: string[];
}

export interface VisualCharacteristics {
  texture: string;
  pattern: string;
  dominantColor: string;
  condition: string;
  damageLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  contamination: string;
}

export interface TextileAnalysisResult {
  id: string;
  batchId?: string;
  inventoryItemId?: string;
  imageName: string;
  imageUrl: string;
  detectedMaterial: string;
  confidenceScore: number; // e.g. 0.94
  fiberComposition: { fiber: string; percentage: number }[];
  visualCharacteristics: VisualCharacteristics;
  wasteCategory: WasteCategory;
  recyclability: 'High' | 'Moderate' | 'Low' | 'Non-Recyclable';
  reusePotential: 'High' | 'Moderate' | 'Low';
  repairPotential: 'High' | 'Moderate' | 'Low' | 'N/A';
  processingFeasibility: 'High' | 'Medium' | 'Low';
  circularity: CircularityBreakdown;
  recommendation: RecoveryStrategy;
  environmentalImpact: EnvironmentalImpact;
  analyzedBy: string;
  analyzedAt: string;
  status: 'Draft' | 'Finalized' | 'Archived';
  notes?: string;
}

export interface RecyclingRecommendationCard {
  id: string;
  title: string;
  strategyCategory: string;
  suitableMaterials: string[];
  recoveryEfficiency: number;
  co2SavingsPerTon: number;
  waterSavingsPerTon: number;
  marketDemand: 'High' | 'Medium' | 'Emerging';
  processingCostEstPerTon: string;
  description: string;
  technicalSteps: string[];
  partnerNetworkCount: number;
}

export type NotificationCategory = 
  | 'Waste Collection'
  | 'Recycling Opportunity'
  | 'Sustainability Milestone'
  | 'Inventory Warning'
  | 'Platform Announcement';

export interface AppNotification {
  id: string;
  type: 'batch' | 'recycling' | 'inventory' | 'sustainability' | 'system';
  category: NotificationCategory;
  title: string;
  message: string;
  read: boolean;
  severity?: 'info' | 'success' | 'warning' | 'critical';
  createdAt: string;
  link?: string;
}

export interface ReportConfig {
  type: 'classification' | 'recycling' | 'sustainability' | 'environmental' | 'circularity';
  title: string;
  dateRange: { start: string; end: string };
  format: 'pdf' | 'excel';
  analysisId?: string;
  includeCharts?: boolean;
  notes?: string;
}
