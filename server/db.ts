import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import initSqlJs from 'sql.js';
import { 
  User, WasteBatch, InventoryItem, TextileAnalysisResult, 
  RecyclingRecommendationCard, AppNotification 
} from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const SQLITE_FILE = path.join(process.cwd(), 'database.sqlite');

interface DatabaseSchema {
  users: User[];
  batches: WasteBatch[];
  inventory: InventoryItem[];
  analyses: TextileAnalysisResult[];
  recommendations: RecyclingRecommendationCard[];
  notifications: AppNotification[];
  systemMetrics: {
    totalWasteProcessedKg: number;
    activeBatchesCount: number;
    overallRecyclabilityRate: number;
    averageCircularityScore: number;
    totalCo2SavedTons: number;
    totalWaterSavedM3: number;
    landfillDivertedPercent: number;
  };
}

// Initial seed password hashes
const defaultPasswordHash = bcrypt.hashSync('password123', 10);

const initialSeedData: DatabaseSchema = {
  users: [
    {
      id: 'usr-admin-01',
      name: 'Yaswanth',
      email: 'yashuyaswanth8919@gmail.com',
      passwordHash: bcrypt.hashSync('admin123', 10),
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      department: 'Lead Researcher & Sustainability Admin',
      status: 'active',
      joinedDate: '2025-01-15',
      lastLogin: '2026-07-23T08:30:00Z'
    },
    {
      id: 'usr-mgr-02',
      name: 'Marcus Holloway',
      email: 'manager@textilewaste.io',
      passwordHash: bcrypt.hashSync('manager123', 10),
      role: 'manager',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
      department: 'Circular Supply Chain & Logistics',
      status: 'active',
      joinedDate: '2025-03-10',
      lastLogin: '2026-07-22T16:45:00Z'
    },
    {
      id: 'usr-anl-03',
      name: 'Dr. Sophia Chen',
      email: 'analyst@textilewaste.io',
      passwordHash: bcrypt.hashSync('analyst123', 10),
      role: 'analyst',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      department: 'Textile Fiber Diagnostics Lab',
      status: 'active',
      joinedDate: '2025-06-01',
      lastLogin: '2026-07-23T07:15:00Z'
    }
  ],

  batches: [
    {
      id: 'BATCH-2026-101',
      title: 'Post-Industrial Denim Trimmings',
      sourceFacility: 'Milano EcoTextiles Mill #4',
      materialType: 'Denim Cotton (98% Cotton / 2% Elastane)',
      weightKg: 4250,
      collectionDate: '2026-07-18',
      status: 'Processing',
      location: 'Warehouse Bay A3 - Milan',
      assignedAnalyst: 'Dr. Sophia Chen',
      itemsCount: 4,
      notes: 'High-purity indigo dyed selvage denim cut-offs. Ideal for mechanical fiber regeneration.',
      createdById: 'usr-mgr-02',
      createdAt: '2026-07-18T09:00:00Z',
      updatedAt: '2026-07-20T14:30:00Z'
    },
    {
      id: 'BATCH-2026-102',
      title: 'Post-Consumer Poly-Cotton Workwear',
      sourceFacility: 'Nordic Logistics Apparel Recovery',
      materialType: 'Poly-Cotton Blend (65% Polyester / 35% Cotton)',
      weightKg: 6800,
      collectionDate: '2026-07-19',
      status: 'Analyzed',
      location: 'Sorting Facility B - Hamburg',
      assignedAnalyst: 'Dr. Sophia Chen',
      itemsCount: 6,
      notes: 'Uniform garments with metallic buttons and zippers. Pre-shredding accessories removal required.',
      createdById: 'usr-mgr-02',
      createdAt: '2026-07-19T11:20:00Z',
      updatedAt: '2026-07-21T10:15:00Z'
    },
    {
      id: 'BATCH-2026-103',
      title: 'Pre-Consumer Pure Merino Wool Scraps',
      sourceFacility: 'Highland Weavers Co.',
      materialType: '100% Virgin Merino Wool Scraps',
      weightKg: 1850,
      collectionDate: '2026-07-20',
      status: 'Approved',
      location: 'Climate Facility C - Edinburgh',
      assignedAnalyst: 'Dr. Sophia Chen',
      itemsCount: 2,
      notes: 'Premium un-dyed merino wool offcuts. High economic value for secondary yarn spinning.',
      createdById: 'usr-admin-01',
      createdAt: '2026-07-20T08:00:00Z',
      updatedAt: '2026-07-22T09:00:00Z'
    },
    {
      id: 'BATCH-2026-104',
      title: 'Mixed Synthetic Sportswear Surplus',
      sourceFacility: 'ActiveTech Apparel Discards',
      materialType: 'Polyester / Nylon Mesh',
      weightKg: 3100,
      collectionDate: '2026-07-21',
      status: 'Awaiting Analysis',
      location: 'Warehouse Bay C1 - Frankfurt',
      assignedAnalyst: 'Dr. Sophia Chen',
      itemsCount: 3,
      notes: 'Contains moisture-wicking coatings. Needs chemical separation analysis.',
      createdById: 'usr-mgr-02',
      createdAt: '2026-07-21T13:45:00Z',
      updatedAt: '2026-07-21T13:45:00Z'
    },
    {
      id: 'BATCH-2026-105',
      title: 'Hospitality Linen & Towel Discards',
      sourceFacility: 'Grand Azure Resort Chain',
      materialType: '100% Ring-Spun Cotton',
      weightKg: 5400,
      collectionDate: '2026-07-22',
      status: 'Collected',
      location: 'Receiving Dock #2 - Lyon',
      itemsCount: 5,
      notes: 'Bleached white hotel bedsheets and terry towels with minor tear damage.',
      createdById: 'usr-mgr-02',
      createdAt: '2026-07-22T07:30:00Z',
      updatedAt: '2026-07-22T07:30:00Z'
    }
  ],

  inventory: [
    {
      id: 'INV-8801',
      batchId: 'BATCH-2026-101',
      materialName: 'Post-Industrial Indigo Denim Scrap',
      fiberComposition: [
        { fiber: 'Cotton', percentage: 98 },
        { fiber: 'Elastane', percentage: 2 }
      ],
      quantityKg: 2400,
      category: 'Recyclable',
      condition: 'Grade A (Pristine)',
      contaminationLevel: 'None',
      recyclabilityScore: 94,
      storageLocation: 'Aisle 4 - Shelf B',
      sourceSupplier: 'Milano EcoTextiles Mill #4',
      receivedDate: '2026-07-18',
      status: 'In Processing',
      notes: 'Scheduled for garnetted fiber production.'
    },
    {
      id: 'INV-8802',
      batchId: 'BATCH-2026-101',
      materialName: 'Heavyweight Canvas Cotton Edge Offcuts',
      fiberComposition: [{ fiber: 'Cotton', percentage: 100 }],
      quantityKg: 1850,
      category: 'Recyclable',
      condition: 'Grade A (Pristine)',
      contaminationLevel: 'None',
      recyclabilityScore: 98,
      storageLocation: 'Aisle 4 - Shelf C',
      sourceSupplier: 'Milano EcoTextiles Mill #4',
      receivedDate: '2026-07-18',
      status: 'Reserved',
      notes: 'Allocated to GreenYarn Spinning Facility.'
    },
    {
      id: 'INV-8803',
      batchId: 'BATCH-2026-102',
      materialName: 'Poly-Cotton Industrial Overalls Discards',
      fiberComposition: [
        { fiber: 'Polyester', percentage: 65 },
        { fiber: 'Cotton', percentage: 35 }
      ],
      quantityKg: 3800,
      category: 'Upcyclable',
      condition: 'Grade B (Minor Wear)',
      contaminationLevel: 'Low',
      recyclabilityScore: 78,
      storageLocation: 'Aisle 12 - Bin 03',
      sourceSupplier: 'Nordic Logistics Apparel Recovery',
      receivedDate: '2026-07-19',
      status: 'Available',
      notes: 'Chemical depolymerization or acoustic insulation padding.'
    },
    {
      id: 'INV-8804',
      batchId: 'BATCH-2026-103',
      materialName: 'Raw Merino Wool Selvage Strip Waste',
      fiberComposition: [{ fiber: 'Merino Wool', percentage: 100 }],
      quantityKg: 1850,
      category: 'Reusable',
      condition: 'Grade A (Pristine)',
      contaminationLevel: 'None',
      recyclabilityScore: 96,
      storageLocation: 'Climate Vault 1',
      sourceSupplier: 'Highland Weavers Co.',
      receivedDate: '2026-07-20',
      status: 'Reserved',
      notes: 'High market demand for acoustic felt and luxury wool carpets.'
    },
    {
      id: 'INV-8805',
      batchId: 'BATCH-2026-104',
      materialName: 'Polyester Mesh Athletic Fabric Scraps',
      fiberComposition: [
        { fiber: 'Polyester', percentage: 92 },
        { fiber: 'Spandex', percentage: 8 }
      ],
      quantityKg: 3100,
      category: 'Recyclable',
      condition: 'Grade B (Minor Wear)',
      contaminationLevel: 'Medium',
      recyclabilityScore: 71,
      storageLocation: 'Aisle 9 - Bin 14',
      sourceSupplier: 'ActiveTech Apparel Discards',
      receivedDate: '2026-07-21',
      status: 'Available',
      notes: 'Subdued color dyes present.'
    },
    {
      id: 'INV-8806',
      batchId: 'BATCH-2026-105',
      materialName: 'White Hotel Percale Linen Cuts',
      fiberComposition: [{ fiber: 'Cotton', percentage: 100 }],
      quantityKg: 5400,
      category: 'Recyclable',
      condition: 'Grade B (Minor Wear)',
      contaminationLevel: 'Low',
      recyclabilityScore: 92,
      storageLocation: 'Dock 2 Holding',
      sourceSupplier: 'Grand Azure Resort Chain',
      receivedDate: '2026-07-22',
      status: 'Available',
      notes: 'Ideal for cellulose chemical dissolving pulp or technical wipes.'
    }
  ],

  analyses: [
    {
      id: 'ANL-2026-001',
      batchId: 'BATCH-2026-101',
      inventoryItemId: 'INV-8801',
      imageName: 'denim_selvage_sample.jpg',
      imageUrl: 'https://images.unsplash.com/photo-1542272604-780c36856d60?w=600&auto=format&fit=crop&q=80',
      detectedMaterial: 'Heavyweight Indigo Denim',
      confidenceScore: 0.96,
      fiberComposition: [
        { fiber: 'Cotton', percentage: 98 },
        { fiber: 'Elastane', percentage: 2 }
      ],
      visualCharacteristics: {
        texture: 'Twill Weave 3x1 Structure',
        pattern: 'Solid Indigo Dyed',
        dominantColor: 'Deep Navy / Indigo',
        condition: 'Pristine Unwashed Cutting Scrap',
        damageLevel: 'Low',
        contamination: 'Negligible oils (<0.1%)'
      },
      wasteCategory: 'Recyclable',
      recyclability: 'High',
      reusePotential: 'High',
      repairPotential: 'N/A',
      processingFeasibility: 'High',
      circularity: {
        materialRecyclability: 33.25, // 95 * 0.35
        materialCondition: 19.0,     // 95 * 0.20
        reusePotential: 18.0,        // 90 * 0.20
        environmentalBenefit: 14.25,  // 95 * 0.15
        processingFeasibility: 9.5,   // 95 * 0.10
        overallScore: 88.0,
        category: 'High Recovery Potential',
        scores: {
          recyclabilityScore: 95,
          reuseScore: 90,
          sustainabilityScore: 95,
          materialRecoveryScore: 92,
          carbonReductionScore: 96,
          circularEconomyScore: 88
        }
      },
      recommendation: {
        primaryAction: 'Mechanical Recycling',
        primary: 'Mechanical Garnetted Fiber Extraction',
        alternative: 'Upcyclable Heavy Tote Canvas Conversion',
        rationale: 'Extremely high cotton content (98%) allows high-yield mechanical pulling into high-staple length recycled cotton fiber without chemical digestion.',
        processingMethod: 'Shredding -> Garnetting -> Rotary Carding -> Secondary Rotor Spinning',
        expectedEfficiencyPercent: 91.5,
        suggestedNextSteps: [
          'Route batch to Mechanical Garnetting Line #2',
          'Remove selvage metal rivets if present',
          'Blend 70% recycled fiber with 30% organic virgin cotton for premium yarn'
        ]
      },
      environmentalImpact: {
        co2SavedKg: 9800,
        waterSavedLiters: 2450000,
        energySavedKwh: 18130,
        landfillAvoidedKg: 2400,
        materialRecoveryRate: 91.5,
        pollutionReductionKg: 1176,
        resourceConservation: {
          fibersSavedKg: 2112,
          virginPolymerAvoidedKg: 1080
        },
        esgSdgAlignment: {
          sdg12: 'SDG 12: Responsible Consumption and Production',
          sdg13: 'SDG 13: Climate Action',
          sdg6: 'SDG 6: Clean Water and Sanitation',
          sdg9: 'SDG 9: Industry, Innovation and Infrastructure'
        }
      },
      analyzedBy: 'Dr. Sophia Chen',
      analyzedAt: '2026-07-18T14:22:00Z',
      status: 'Finalized',
      notes: 'Analysis validated by NIR spectroscopy lab test.'
    },
    {
      id: 'ANL-2026-002',
      batchId: 'BATCH-2026-102',
      inventoryItemId: 'INV-8803',
      imageName: 'workwear_poly_cotton.jpg',
      imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80',
      detectedMaterial: 'Poly-Cotton Twill Uniform Fabric',
      confidenceScore: 0.91,
      fiberComposition: [
        { fiber: 'Polyester', percentage: 65 },
        { fiber: 'Cotton', percentage: 35 }
      ],
      visualCharacteristics: {
        texture: 'Reinforced Ripstop Weave',
        pattern: 'Hi-Vis Striped',
        dominantColor: 'Industrial Blue / Yellow',
        condition: 'Post-consumer worn workwear',
        damageLevel: 'Moderate',
        contamination: 'Traces of reflective trim tape'
      },
      wasteCategory: 'Upcyclable',
      recyclability: 'Moderate',
      reusePotential: 'Moderate',
      repairPotential: 'Moderate',
      processingFeasibility: 'Medium',
      circularity: {
        materialRecyclability: 25.2, // 72 * 0.35
        materialCondition: 15.0,    // 75 * 0.20
        reusePotential: 14.0,       // 70 * 0.20
        environmentalBenefit: 12.0, // 80 * 0.15
        processingFeasibility: 7.0,  // 70 * 0.10
        overallScore: 73.2,
        category: 'Moderate Recovery Potential',
        scores: {
          recyclabilityScore: 72,
          reuseScore: 70,
          sustainabilityScore: 78,
          materialRecoveryScore: 72,
          carbonReductionScore: 80,
          circularEconomyScore: 73
        }
      },
      recommendation: {
        primaryAction: 'Upcycling',
        primary: 'Thermomechanical Hydro-Thermal Separation',
        alternative: 'Industrial Acoustic Insulation Batting',
        rationale: 'Poly-cotton intimacy blends require specialized hydro-thermal enzymatic dissolution or thermomechanical shredding into non-woven automotive acoustics.',
        processingMethod: 'De-trimming -> Rotary Shearing -> Thermobonded Nonwoven Needlepunching',
        expectedEfficiencyPercent: 84.0,
        suggestedNextSteps: [
          'De-trim reflective polyurethane strips and zip hardware',
          'Feed into non-woven acoustic carding line',
          'Ship needlepunched insulation rolls to automotive supplier'
        ]
      },
      environmentalImpact: {
        co2SavedKg: 11400,
        waterSavedLiters: 1150000,
        energySavedKwh: 21090,
        landfillAvoidedKg: 3800,
        materialRecoveryRate: 84.0,
        pollutionReductionKg: 1368,
        resourceConservation: {
          fibersSavedKg: 3344,
          virginPolymerAvoidedKg: 1710
        },
        esgSdgAlignment: {
          sdg12: 'SDG 12: Responsible Consumption and Production',
          sdg13: 'SDG 13: Climate Action',
          sdg6: 'SDG 6: Clean Water and Sanitation',
          sdg9: 'SDG 9: Industry, Innovation and Infrastructure'
        }
      },
      analyzedBy: 'Dr. Sophia Chen',
      analyzedAt: '2026-07-19T16:10:00Z',
      status: 'Finalized',
      notes: 'Trimming required before mechanical processing.'
    }
  ],

  recommendations: [
    {
      id: 'REC-STRAT-01',
      title: 'Mechanical Fiber Recycling (Closed-Loop Yarn Spinning)',
      strategyCategory: 'Fiber Recycling',
      suitableMaterials: ['100% Cotton', 'Denim Cut-Offs', '100% Wool Scraps', 'Linen Cuts'],
      recoveryEfficiency: 92.5,
      co2SavingsPerTon: 4.1,
      waterSavingsPerTon: 1020,
      marketDemand: 'High',
      processingCostEstPerTon: '$280 - $350 / Ton',
      description: 'Direct mechanical garnetting pulls fabric back into pure individual fibers without breaking polymer chains, preserving organic fiber properties.',
      technicalSteps: [
        'Automated optical sorting & color categorization',
        'Metal, button, and zipper de-trimming',
        'Multi-cylinder garnetting & fiber opening',
        'Secondary rotor-spinning blend with 20% organic virgin carrier fiber'
      ],
      partnerNetworkCount: 14
    },
    {
      id: 'REC-STRAT-02',
      title: 'Cellulosic Dissolution Pulping (Circulose Chemistry)',
      strategyCategory: 'Chemical Recycling',
      suitableMaterials: ['Post-Consumer Cotton Sheets', 'Viscose Discards', 'High-Cellulose Blends (<5% Poly)'],
      recoveryEfficiency: 88.0,
      co2SavingsPerTon: 3.8,
      waterSavingsPerTon: 890,
      marketDemand: 'High',
      processingCostEstPerTon: '$420 - $510 / Ton',
      description: 'Chemical dissolution breaks down cellulosic textiles into pure liquid pulp, which is re-extruded into brand-new Lyocell / Viscose staple fibers.',
      technicalSteps: [
        'Enzymatic de-coloring & bleach treatment',
        'Chemical cellulose dissolution in eco-solvent bath',
        'Filtration & solvent recovery closed-loop loop (>99.5% solvent recycled)',
        'Spinneret wet-spinning into high-tenacity Lyocell tow'
      ],
      partnerNetworkCount: 8
    },
    {
      id: 'REC-STRAT-03',
      title: 'Non-Woven Automotive & Building Insulation',
      strategyCategory: 'Upcycling',
      suitableMaterials: ['Poly-Cotton Blends', 'Mixed Synthetic Knit Scraps', 'Carpet Tiles'],
      recoveryEfficiency: 95.0,
      co2SavingsPerTon: 2.9,
      waterSavingsPerTon: 450,
      marketDemand: 'Medium',
      processingCostEstPerTon: '$180 - $240 / Ton',
      description: 'Blended or damaged textiles are shredded and needle-punched with low-melt synthetic binder fibers into thermal and acoustic barrier pads.',
      technicalSteps: [
        'Coarse shredding & dust extraction',
        'Blend with 15% low-melt polyester binder fiber',
        'Air-lay web formation & needle-punching',
        'Thermal bonding oven curing at 160°C'
      ],
      partnerNetworkCount: 22
    },
    {
      id: 'REC-STRAT-04',
      title: 'High-Value Garment Remanufacturing & Fabric Reuse',
      strategyCategory: 'Fabric Reuse',
      suitableMaterials: ['Grade A Denim Selvage', 'Virgin Wool Sweaters', 'Silk Discards'],
      recoveryEfficiency: 98.0,
      co2SavingsPerTon: 5.6,
      waterSavingsPerTon: 1450,
      marketDemand: 'High',
      processingCostEstPerTon: '$120 - $200 / Ton',
      description: 'Large intact fabric panels and pristine manufacturing offcuts are redirected directly to fashion upcycling studios for zero-waste garment assembly.',
      technicalSteps: [
        'Precision automated panel size inspection',
        'Defect tagging & laser cut optimization',
        'Direct dispatch to partner circular apparel brands'
      ],
      partnerNetworkCount: 19
    }
  ],

  notifications: [
    {
      id: 'NOTIF-101',
      type: 'batch',
      category: 'Waste Collection',
      title: 'New Waste Batch Intake (Dock #2)',
      message: 'Batch BATCH-2026-105 (Hospitality Linen & Towel Discards - 5.4 Tons) arrived at Receiving Dock #2 from Grand Azure Resort Chain.',
      read: false,
      severity: 'info',
      createdAt: '2026-07-22T07:35:00Z',
      link: 'batches'
    },
    {
      id: 'NOTIF-102',
      type: 'recycling',
      category: 'Recycling Opportunity',
      title: 'High-Value Circular Buyer Match',
      message: 'GreenYarn Spinning Facility requested 1,850 kg of Pure Merino Wool Selvage Scraps (INV-8804) for luxury carpet yarn blending.',
      read: false,
      severity: 'success',
      createdAt: '2026-07-22T06:12:00Z',
      link: 'recommendations'
    },
    {
      id: 'NOTIF-103',
      type: 'sustainability',
      category: 'Sustainability Milestone',
      title: 'Circularity Milestone: 88.4% Average Score',
      message: 'Your regional facility achieved an 88.4% average circularity score across all Q3 textile waste intake, displacing 42.8 Tons of Scope 3 CO₂.',
      read: false,
      severity: 'success',
      createdAt: '2026-07-21T18:00:00Z',
      link: 'sustainability'
    },
    {
      id: 'NOTIF-104',
      type: 'inventory',
      category: 'Inventory Warning',
      title: 'Warehouse Bay Storage Warning (89% Full)',
      message: 'Warehouse Bay A3 is currently at 89% capacity. Consider dispatching BATCH-2026-101 to Mechanical Garnetting line #2.',
      read: true,
      severity: 'warning',
      createdAt: '2026-07-20T09:15:00Z',
      link: 'inventory'
    },
    {
      id: 'NOTIF-105',
      type: 'system',
      category: 'Platform Announcement',
      title: 'AI Multimodal Vision Model v2.5 Online',
      message: 'Updated YOLOv8 + EfficientNet fabric classifier deployed with 96.8% multi-fiber blend accuracy and automated ISO 14040 carbon accounting.',
      read: true,
      severity: 'info',
      createdAt: '2026-07-19T14:30:00Z',
      link: 'analysis'
    },
    {
      id: 'NOTIF-106',
      type: 'inventory',
      category: 'Inventory Warning',
      title: 'High Elastane Blend Contamination Alert',
      message: 'Batch BATCH-2026-104 detected 8% Spandex content. Chemical sorting separation route recommended over direct mechanical shredding.',
      read: false,
      severity: 'warning',
      createdAt: '2026-07-18T11:20:00Z',
      link: 'inventory'
    },
    {
      id: 'NOTIF-107',
      type: 'sustainability',
      category: 'Sustainability Milestone',
      title: '100,000 Liters Water Conservation Target Passed',
      message: 'Closed-loop cellulose recycling pathways have officially diverted and conserved over 148,200 liters of freshwater this quarter.',
      read: true,
      severity: 'success',
      createdAt: '2026-07-17T16:45:00Z',
      link: 'environmental'
    }
  ],

  systemMetrics: {
    totalWasteProcessedKg: 21400,
    activeBatchesCount: 5,
    overallRecyclabilityRate: 88.4,
    averageCircularityScore: 84.6,
    totalCo2SavedTons: 64.2,
    totalWaterSavedM3: 14200,
    landfillDivertedPercent: 93.8
  }
};

// Guarantee persistence
let sqlInstance: any = null;

async function syncSqliteFile(data: DatabaseSchema) {
  try {
    if (!sqlInstance) {
      sqlInstance = await initSqlJs();
    }
    const db = new sqlInstance.Database();

    // Create tables
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT,
        role TEXT,
        department TEXT,
        status TEXT,
        joinedDate TEXT,
        lastLogin TEXT
      );
      CREATE TABLE IF NOT EXISTS batches (
        id TEXT PRIMARY KEY,
        title TEXT,
        sourceFacility TEXT,
        materialType TEXT,
        weightKg REAL,
        collectionDate TEXT,
        status TEXT,
        location TEXT,
        assignedAnalyst TEXT,
        itemsCount INTEGER,
        notes TEXT,
        createdAt TEXT
      );
      CREATE TABLE IF NOT EXISTS inventory (
        id TEXT PRIMARY KEY,
        batchId TEXT,
        materialName TEXT,
        quantityKg REAL,
        category TEXT,
        condition TEXT,
        contaminationLevel TEXT,
        recyclabilityScore REAL,
        storageLocation TEXT,
        status TEXT,
        receivedDate TEXT
      );
      CREATE TABLE IF NOT EXISTS analyses (
        id TEXT PRIMARY KEY,
        imageName TEXT,
        detectedMaterial TEXT,
        wasteCategory TEXT,
        confidenceScore REAL,
        analyzedAt TEXT,
        analyzedBy TEXT,
        batchId TEXT
      );
      CREATE TABLE IF NOT EXISTS system_metrics (
        key TEXT PRIMARY KEY,
        value REAL
      );
    `);

    // Insert Users
    data.users.forEach(u => {
      db.run(`INSERT OR REPLACE INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
        u.id, u.name, u.email, u.role, u.department || '', u.status || 'active', u.joinedDate || '', u.lastLogin || ''
      ]);
    });

    // Insert Batches
    data.batches.forEach(b => {
      db.run(`INSERT OR REPLACE INTO batches VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        b.id, b.title, b.sourceFacility, b.materialType, b.weightKg, b.collectionDate, b.status, b.location, b.assignedAnalyst || '', b.itemsCount || 0, b.notes || '', b.createdAt || ''
      ]);
    });

    // Insert Inventory
    data.inventory.forEach(i => {
      db.run(`INSERT OR REPLACE INTO inventory VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        i.id, i.batchId || '', i.materialName, i.quantityKg, i.category, i.condition || '', i.contaminationLevel || '', i.recyclabilityScore, i.storageLocation || '', i.status, i.receivedDate || ''
      ]);
    });

    // Insert Analyses
    data.analyses.forEach(a => {
      db.run(`INSERT OR REPLACE INTO analyses VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
        a.id, a.imageName || '', a.detectedMaterial, a.wasteCategory, a.confidenceScore, a.analyzedAt, a.analyzedBy || '', a.batchId || ''
      ]);
    });

    // Insert Metrics
    if (data.systemMetrics) {
      Object.entries(data.systemMetrics).forEach(([key, val]) => {
        db.run(`INSERT OR REPLACE INTO system_metrics VALUES (?, ?)`, [key, Number(val)]);
      });
    }

    const binaryArray = db.export();
    const buffer = Buffer.from(binaryArray);
    fs.writeFileSync(SQLITE_FILE, buffer);
  } catch (err) {
    console.error('Error syncing database.sqlite:', err);
  }
}

export function getDb(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialSeedData, null, 2), 'utf-8');
    syncSqliteFile(initialSeedData);
    return initialSeedData;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as DatabaseSchema;
    syncSqliteFile(parsed);
    return parsed;
  } catch (err) {
    console.error('Error reading db.json, re-initializing:', err);
    fs.writeFileSync(DB_FILE, JSON.stringify(initialSeedData, null, 2), 'utf-8');
    syncSqliteFile(initialSeedData);
    return initialSeedData;
  }
}

export function recalculateSystemMetrics(data: DatabaseSchema): void {
  if (!data) return;

  // Active batches & weight
  const totalBatchWeight = (data.batches || []).reduce((acc, b) => acc + (Number(b.weightKg) || 0), 0);
  const totalInventoryWeight = (data.inventory || []).reduce((acc, i) => acc + (Number(i.quantityKg) || 0), 0);
  const totalWeight = totalBatchWeight + totalInventoryWeight;

  const activeBatchesCount = (data.batches || []).filter(b => b.status !== 'Completed').length;

  // Circularity scores aggregation
  const analysisScores = (data.analyses || []).map(a => a.circularity?.overallScore).filter((s): s is number => typeof s === 'number');
  const inventoryScores = (data.inventory || []).map(i => i.recyclabilityScore).filter((s): s is number => typeof s === 'number');
  const allScores = [...analysisScores, ...inventoryScores];

  const avgScore = allScores.length > 0 
    ? Math.round((allScores.reduce((a, b) => a + b, 0) / allScores.length) * 10) / 10 
    : 84.6;

  // Environmental savings calculation from actual analysis items
  let sumCo2Kg = 0;
  let sumWaterLiters = 0;

  (data.analyses || []).forEach(a => {
    if (a.environmentalImpact) {
      sumCo2Kg += Number(a.environmentalImpact.co2SavedKg) || 0;
      sumWaterLiters += Number(a.environmentalImpact.waterSavedLiters) || 0;
    }
  });

  // Base estimations plus analyzed items
  const totalCo2Tons = Math.round(((sumCo2Kg / 1000) + (totalWeight * 0.0028)) * 10) / 10;
  const totalWaterM3 = Math.round((sumWaterLiters / 1000) + (totalWeight * 0.58));

  // Landfill diverted percentage
  const recyclableCount = (data.inventory || []).filter(i => i.category !== 'Hazardous Textile Waste').length;
  const totalInvCount = (data.inventory || []).length;
  const divertedPercent = totalInvCount > 0 ? Math.round((recyclableCount / totalInvCount) * 1000) / 10 : 93.8;

  data.systemMetrics = {
    totalWasteProcessedKg: totalWeight,
    activeBatchesCount,
    overallRecyclabilityRate: avgScore,
    averageCircularityScore: avgScore,
    totalCo2SavedTons: totalCo2Tons || 64.2,
    totalWaterSavedM3: totalWaterM3 || 14200,
    landfillDivertedPercent: divertedPercent || 93.8
  };
}

export function saveDb(data: DatabaseSchema): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  recalculateSystemMetrics(data);
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  syncSqliteFile(data);
}

// Ensure database files (db.json and database.sqlite) are created on module initialization
getDb();
