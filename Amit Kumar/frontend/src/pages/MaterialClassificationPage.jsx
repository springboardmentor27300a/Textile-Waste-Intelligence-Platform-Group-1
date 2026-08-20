import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import inventoryService from '../services/inventoryService';
import { useAuth } from '../context/AuthContext';
import { 
  Upload, 
  Sparkles, 
  RefreshCw, 
  Layers, 
  CheckCircle, 
  AlertCircle,
  AlertTriangle, 
  Camera,
  MapPin,
  Trash2,
  BookmarkPlus,
  Download,
  FileText,
  Eye
} from 'lucide-react';

const MaterialClassificationPage = () => {
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Upload States
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Scanner & Results States
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Register Inventory States
  const [showLocationSelect, setShowLocationSelect] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('1');
  const [savingToInventory, setSavingToInventory] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [quickQuantity, setQuickQuantity] = useState('150.0');

  const canModify = true; // All roles are permitted to log classified items to inventory

  // Handle Drag & Drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    setError('');
    setResult(null);
    setShowLocationSelect(false);
    
    // Check format
    const validExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.bmp'];
    const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext) || file.type.includes(ext.replace('.', '')));
    
    if (!hasValidExt) {
      setError('Unsupported image format. Please upload PNG, JPG, JPEG, WEBP or BMP.');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // Perform AI Image Analysis
  const handleAnalyze = async () => {
    if (!selectedFile) return;
    
    setScanning(true);
    setError('');
    
    // Animate scanner steps
    const steps = [
      'Reading raw pixel grid...',
      'Extracting dominant color RGB signatures...',
      'Analyzing weave textures and fabric density...',
      'Matching composition patterns...',
      'Calculating weighted circularity score...'
    ];
    
    for (let i = 0; i < steps.length; i++) {
      setScanStep(steps[i]);
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    try {
      const report = await inventoryService.analyzeImage(selectedFile);
      setResult(report);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Failed to analyze image. Please verify connection to the FastAPI backend.');
      }
    } finally {
      setScanning(false);
      setScanStep('');
    }
  };

  // Run with mock/sample data (if no image is immediately available)
  const handleTrySample = async () => {
    setError('');
    setResult(null);
    setScanning(true);
    
    // Simulated file properties
    const mockFile = { name: 'cotton-fabric-scrap.jpg' };
    setSelectedFile(mockFile);
    setPreviewUrl('https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?q=80&w=400&auto=format&fit=crop'); // Mock textile image
    
    const steps = [
      'Acquiring sample image buffer...',
      'Analyzing color composition (RGB)...',
      'Scanning natural cotton weave density...',
      'Predicting fiber blend ratio...',
      'Calculating circularity performance...'
    ];

    for (let i = 0; i < steps.length; i++) {
      setScanStep(steps[i]);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Set sample result
    setResult({
      filename: 'cotton-fabric-scrap.jpg',
      dimensions: '800 x 600 px',
      dominant_color: {
        hex: '#f5efe6',
        name: 'White (Soft Cream)',
        rgb: [245, 239, 230]
      },
      fabric_type: 'Cotton',
      composition: '100% Organic Cotton',
      condition: 'Clean',
      has_contaminants: false,
      pattern: 'Solid Weave',
      category: 'Recyclable',
      recommendation: 'Mechanical Fiber Shredding: Cotton fibers are long and clean. Recommended for spinning into carded yarn for circular denim lines.',
      metrics: {
        recyclability: 95,
        condition: 90,
        reuse_potential: 85,
        environmental_benefit: 95,
        processing_feasibility: 90
      },
      circularity_score: 91,
      circularity_category: 'Excellent Recovery Potential'
    });
    setScanning(false);
  };

  // Add the analyzed report directly to database inventory
  const handleRegisterInventory = async () => {
    if (!result || !canModify) return;
    
    setSavingToInventory(true);
    setError('');
    
    const colorStr = typeof result.dominant_color === 'object' 
      ? (result.dominant_color?.name || 'Mixed Color') 
      : (result.dominant_color || 'Mixed Color');

    const recyclabilityValue = result.metrics?.recyclability 
      ?? (result.recyclability != null ? result.recyclability : 90);

    const payload = {
      fabric_type: result.fabric_type || 'Polyester',
      source: 'Pre-consumer', // Default to pre-consumer scraps
      quantity: parseFloat(quickQuantity) || 150.0,
      color: colorStr,
      condition: result.condition || 'Clean',
      collection_date: new Date().toISOString().split('T')[0],
      status: 'Collected',
      inventory_id: parseInt(selectedLocation) || 1,
      textile_wastes: [
        {
          material_composition: result.composition || '100% Textile Fiber',
          recyclability_rate: recyclabilityValue / 100,
          has_contaminants: result.has_contaminants || false
        }
      ]
    };

    try {
      await inventoryService.createWasteBatch(payload);
      setSaveSuccess(true);
      setTimeout(() => {
        navigate('/inventory');
      }, 1500);
    } catch (err) {
      console.error('Failed to register batch to inventory:', err);
      const detailMsg = err.response?.data?.detail 
        || (Array.isArray(err.response?.data?.detail) ? err.response.data.detail[0]?.msg : null)
        || err.message 
        || 'Failed to save batch to warehouse inventory.';
      setError(detailMsg);
    } finally {
      setSavingToInventory(false);
    }
  };

  // Generate and download a formatted text classification report (Milestone 2)
  const handleDownloadReport = () => {
    if (!result) return;
    
    const reportText = `==================================================
TEXTILE WASTE INTELLIGENCE PLATFORM
AI MATERIAL CLASSIFICATION AUDIT REPORT
==================================================
Generated on : ${new Date().toLocaleString()}
Source File  : ${result.filename || 'Sample scan'}
Dimensions   : ${result.dimensions}
Pattern Type : ${result.pattern || 'Solid'}
Physical Cat : ${result.category || 'Recyclable'}

FABRIC CLASSIFICATION:
--------------------------------------------------
Primary Fabric Type : ${result.fabric_type}
Fiber Composition   : ${result.composition}
Physical Condition  : ${result.condition}
Hazard / Stains     : ${result.has_contaminants ? 'Yes (Detected)' : 'No (None Detected)'}

CIRCULARITY PERFORMANCE ASSESSMENT:
--------------------------------------------------
Circularity Score    : ${result.circularity_score}/100
Recovery Category    : ${result.circularity_category}

Circularity Scoring Metrics Breakdown:
- Recyclability Rate    : ${result.metrics.recyclability}%
- Material Condition    : ${result.metrics.condition}%
- Reuse Potential       : ${result.metrics.reuse_potential}%
- Environmental Benefit : ${result.metrics.environmental_benefit}%
- Processing Feasibility: ${result.metrics.processing_feasibility}%

STRATEGY & RECYCLING RECOMMENDATIONS:
--------------------------------------------------
${result.recommendation}

==================================================
END OF REPORT
==================================================`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Textile_Classification_Report_${result.fabric_type}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    if (!result) return;

    const visibleDamageList = result.visible_damages || [];
    const visibleDamagesStr = visibleDamageList.join(', ') || 'None Detected';
    
    const contaminantList = result.contaminants_detected || [];
    const contaminantsStr = contaminantList.join(', ') || 'None Detected';

    const fabric = result.fabric_type || 'Cotton';
    const condition = result.condition || 'Clean';
    const composition = result.composition || '100% Cotton';
    const isContaminated = result.has_contaminants || false;

    // Detailed text matching engine for rich 3-page report
    let reusePotentialText = "";
    let upcyclingPotentialText = "";
    let preparationText = "";
    let recyclingMethodsText = "";
    let recyclingMaterialsText = "";
    let disposalText = "";

    const fLower = fabric.toLowerCase();

    if (fLower.includes("cotton") || fLower.includes("linen") || fLower.includes("denim")) {
      reusePotentialText = `Direct reuse is highly feasible for clean ${fabric} waste batches. High-grade scraps can be sorted and packaged for secondary craft markets, household cleaning cloths, or commercial wiping rags. Direct donation to local community thrift networks represents the highest tier of resource circularity.`;
      upcyclingPotentialText = `Excellent structural potential for upcycling. Clean fabric panels can be cut and stitched into custom tote bags, denim patch accents, aprons, upholstery liners, or insulation sleeves. The high fiber tensile strength makes cotton particularly suitable for artisanal crafts.`;
      preparationText = `1. Hardware De-trimming: Remove all zippers, plastic/metal buttons, and stitching threads.\n2. Sanitation Laundry: Wash at 60°C with eco-friendly detergent to remove surface oils.\n3. Fiber-Length Grading: Sort scraps by fiber staple length to route to appropriate carding lines.`;
      recyclingMethodsText = `Mechanical shredding pulls fibers back into a loose cotton fluff, which can be re-spun into yarn (often blended with virgin polyester to maintain durability). For chemical recycling, cellulose dissolution via Lyocell or Viscose processing is used to make regenerated cellulosic fibers.`;
      recyclingMaterialsText = `Mechanical fiber-pulling carding machines, staple sorting screens. For chemical dissolution: N-Methylmorpholine N-oxide (NMMO) solvents, sodium hydroxide, or sulfuric acid baths along with specialized extrusion spinnerets.`;
      disposalText = `As a natural cellulosic fiber, clean ${fabric} is 100% biodegradable. If highly contaminated (e.g. grease/oil stained) making it unrecyclable, it should be routed to an industrial composting facility. Under proper temperature and moisture conditions, it will degrade completely in 2-4 months without leaving toxic residues, avoiding methane generation in deep landfills.`;
    } else if (fLower.includes("polyester") || fLower.includes("nylon") || fLower.includes("acrylic")) {
      reusePotentialText = `Synthetic ${fabric} holds high durability, allowing scraps to be directly reused as industrial cargo covers, protective wrap sheeting, durable tarps, or weather-resistant agricultural storage bags.`;
      upcyclingPotentialText = `scraps can be compiled as stuffing filler for outdoor pillows, pet bedding, insulation batts, acoustic panels, or heavy-duty canvas reinforcing liners.`;
      preparationText = `1. Separation: Segregate colored synthetic polymers to prevent dye contamination during melt processing.\n2. Chemical cleaning: Wash with hot alkaline solutions to strip surface coatings, print inks, or grease.\n3. Pelletization: Shred into fine flakes suitable for extrusion feedstocks.`;
      recyclingMethodsText = `Chemical depolymerization via glycolysis, methanolysis, or hydrolysis breaks down the polymer chains back into pure monomers (e.g., BHET, DMT). These are then re-polymerized into virgin-quality rPET. Alternatively, mechanical extrusion pelletization melts the shredded flakes at 260°C and extrudes them into rPET chips.`;
      recyclingMaterialsText = `Glycolysis solvents (monoethylene glycol), catalyst salts (zinc acetate, cobalt acetate), high-temperature vacuum reactors, double-screw melt pelletizing extruders.`;
      disposalText = `Synthetic polymers are non-biodegradable and will persist in landfills for over 400 years. If contaminated beyond recycling, the best disposal method is controlled waste-to-energy (WtE) combustion. This process incinerates the material at over 850°C, recovering high-heat calorific energy to generate electricity while utilizing electrostatic precipitators and gas scrubbers to filter out 98% of particulates.`;
    } else {
      reusePotentialText = `Scraps can be sorted for direct reuse in low-wear settings, such as packaging spacers, furniture backing felt, or insulation blankets. Clean portions can be donated to artisanal craft workshops.`;
      upcyclingPotentialText = `Scraps can be converted into soundproofing panels, heavy felt protective bags, utility lining material, or custom handmade patchwork decorations.`;
      preparationText = `1. Trim removal: Clip out all hardware, threads, and seams.\n2. Shredding: Break down the mixed material into uniform fibers.\n3. Sanitization: Steam cleaning at high temperature.`;
      recyclingMethodsText = `Mechanical shredding is the primary method to convert mixed blends into low-grade industrial felt, insulation blankets, or stuffing fibers. Chemical separation is developing but is limited to removing cellulosics from polyesters.`;
      recyclingMaterialsText = `Rotary industrial shredders, garnetting machines, needle-punching felting lines.`;
      disposalText = `Mixed fabric blends are difficult to recycle. If disposal is required, they should be sent to municipal waste-to-energy recovery systems to capture fuel value, or managed in modern sanitary landfills equipped with geomembrane liners and active methane-capture systems to minimize environmental leakage.`;
    }

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>TWIP_AI_Classification_Report_${result.fabric_type}</title>
          <style>
            @media print {
              body {
                margin: 0;
                padding: 0;
              }
              .page {
                page-break-after: always;
                break-after: page;
                min-height: 297mm; /* Standard A4 height */
                padding: 20mm;
                box-sizing: border-box;
              }
              .page:last-child {
                page-break-after: avoid;
                break-after: avoid;
              }
            }
            body {
              font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              color: #1e293b;
              margin: 40px;
              line-height: 1.6;
              background-color: #ffffff;
            }
            .page {
              margin-bottom: 40px;
              border-bottom: 2px dashed #cbd5e1;
              padding-bottom: 40px;
            }
            .page:last-child {
              border-bottom: none;
              margin-bottom: 0;
              padding-bottom: 0;
            }
            .header-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .brand {
              font-size: 26px;
              font-weight: 900;
              color: #0f766e;
              letter-spacing: -0.02em;
            }
            .title {
              font-size: 14px;
              color: #64748b;
              text-align: right;
              font-weight: 700;
              letter-spacing: 0.05em;
              text-transform: uppercase;
            }
            .divider {
              border-bottom: 3px solid #0f766e;
              margin-bottom: 25px;
            }
            .section-title {
              font-size: 13px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              color: #0f766e;
              border-bottom: 2px solid #f1f5f9;
              padding-bottom: 6px;
              margin-bottom: 12px;
              margin-top: 25px;
            }
            .grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 15px;
            }
            .card {
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 15px;
              background-color: #f8fafc;
            }
            .metric-row {
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              font-weight: 600;
              padding: 6px 0;
              border-bottom: 1px dashed #e2e8f0;
            }
            .metric-row:last-child {
              border-bottom: none;
            }
            .label {
              color: #64748b;
            }
            .val {
              color: #0f172a;
            }
            .color-box {
              display: inline-block;
              width: 24px;
              height: 14px;
              border-radius: 4px;
              border: 1px solid #cbd5e1;
              vertical-align: middle;
              margin-right: 6px;
            }
            .score-badge {
              background-color: #0f766e;
              color: white;
              padding: 4px 10px;
              border-radius: 6px;
              font-weight: 700;
            }
            .info-box {
              background-color: #f8fafc;
              border-left: 4px solid #0f766e;
              border-radius: 4px;
              padding: 15px;
              font-size: 13px;
              color: #334155;
              margin-top: 10px;
              margin-bottom: 15px;
            }
            .footer {
              margin-top: 40px;
              font-size: 10px;
              text-align: center;
              color: #94a3b8;
              font-weight: 600;
              border-top: 1px solid #e2e8f0;
              padding-top: 15px;
            }
            .page-number {
              text-align: right;
              font-size: 11px;
              font-weight: 700;
              color: #64748b;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <!-- PAGE 1: CLASSIFICATION SUMMARY & SCANS -->
          <div class="page">
            <table class="header-table">
              <tr>
                <td class="brand">TWIP</td>
                <td class="title">AI Classification Audit Report (Page 1/3)</td>
              </tr>
            </table>
            <div class="divider"></div>
            
            <div class="grid">
              <div class="card">
                <div class="section-title" style="margin-top: 0;">Scan Metadata</div>
                <div class="metric-row">
                  <span class="label">Source File</span>
                  <span class="val">${result.filename || 'Sample scan'}</span>
                </div>
                <div class="metric-row">
                  <span class="label">Dimensions</span>
                  <span class="val">${result.dimensions || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="label">Model Classifier</span>
                  <span class="val">${result.model_used || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="label">Model Confidence</span>
                  <span class="val">${Math.round(result.confidence_score * 100)}%</span>
                </div>
              </div>

              <div class="card">
                <div class="section-title" style="margin-top: 0;">Circularity Scoring</div>
                <div class="metric-row">
                  <span class="label">Circularity Score</span>
                  <span class="val"><span class="score-badge">${result.circularity_score}/100</span></span>
                </div>
                <div class="metric-row">
                  <span class="label">Recovery Level</span>
                  <span class="val" style="color: #0f766e; font-weight: 700;">${result.circularity_category}</span>
                </div>
                <div class="metric-row">
                  <span class="label">Waste Category</span>
                  <span class="val">${result.category}</span>
                </div>
              </div>
            </div>

            <div class="section-title">Fabric Material Details</div>
            <div class="grid">
              <div>
                <div class="metric-row">
                  <span class="label">Fabric Type</span>
                  <span class="val">${result.fabric_type}</span>
                </div>
                <div class="metric-row">
                  <span class="label">Composition Blend</span>
                  <span class="val">${result.composition}</span>
                </div>
                <div class="metric-row">
                  <span class="label">Weave Texture</span>
                  <span class="val">${result.texture || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="label">Visual Pattern</span>
                  <span class="val">${result.pattern}</span>
                </div>
              </div>
              <div>
                <div class="metric-row">
                  <span class="label">Dominant Color</span>
                  <span class="val">
                    <span class="color-box" style="background-color: ${result.dominant_color.hex};"></span>
                    ${result.dominant_color.name} (${result.dominant_color.hex})
                  </span>
                </div>
                <div class="metric-row">
                  <span class="label">Physical Condition</span>
                  <span class="val">${result.condition}</span>
                </div>
                <div class="metric-row">
                  <span class="label">Visible Damage</span>
                  <span class="val">${visibleDamagesStr}</span>
                </div>
                <div class="metric-row">
                  <span class="label">Contaminants Detected</span>
                  <span class="val">${contaminantsStr}</span>
                </div>
              </div>
            </div>

            <div class="section-title">Circularity Score Breakdown</div>
            <div class="grid" style="grid-template-columns: 1fr 1fr 1fr 1fr 1fr; text-align: center; gap: 10px;">
              <div class="card" style="padding: 10px;">
                <div class="label" style="font-size: 9px; text-transform: uppercase;">Recyclability</div>
                <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 5px;">${result.metrics.recyclability}%</div>
              </div>
              <div class="card" style="padding: 10px;">
                <div class="label" style="font-size: 9px; text-transform: uppercase;">Condition</div>
                <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 5px;">${result.metrics.condition}%</div>
              </div>
              <div class="card" style="padding: 10px;">
                <div class="label" style="font-size: 9px; text-transform: uppercase;">Reuse</div>
                <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 5px;">${result.metrics.reuse_potential}%</div>
              </div>
              <div class="card" style="padding: 10px;">
                <div class="label" style="font-size: 9px; text-transform: uppercase;">Eco Benefit</div>
                <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 5px;">${result.metrics.environmental_benefit}%</div>
              </div>
              <div class="card" style="padding: 10px;">
                <div class="label" style="font-size: 9px; text-transform: uppercase;">Feasibility</div>
                <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 5px;">${result.metrics.processing_feasibility}%</div>
              </div>
            </div>

            <div class="section-title">Classification Explanation</div>
            <p style="font-size: 12px; color: #475569; margin: 0; line-height: 1.6;">
              ${result.categorization_explanation || 'N/A'}
            </p>
            
            <div class="page-number">Page 1 of 3</div>
          </div>

          <!-- PAGE 2: REUSE & UPCYCLING GUIDELINES -->
          <div class="page">
            <table class="header-table">
              <tr>
                <td class="brand">TWIP</td>
                <td class="title">AI Classification Audit Report (Page 2/3)</td>
              </tr>
            </table>
            <div class="divider"></div>

            <div class="section-title">1. Textile Reuse Potential</div>
            <p style="font-size: 13px; color: #334155; line-height: 1.7; margin-bottom: 20px;">
              ${reusePotentialText}
            </p>

            <div class="section-title">2. Creative Upcycling Strategies</div>
            <p style="font-size: 13px; color: #334155; line-height: 1.7; margin-bottom: 20px;">
              Based on the physical condition (<strong>${condition}</strong>) and material structure (<strong>${composition}</strong>), the following upcycling opportunities are recommended:
            </p>
            <div class="info-box" style="font-weight: 600;">
              🎨 Upcycling Concept: ${upcyclingPotentialText}
            </div>

            <div class="section-title">3. Batch Preparation Instructions</div>
            <p style="font-size: 13px; color: #334155; line-height: 1.7; white-space: pre-line;">
              ${preparationText}
            </p>

            <div class="footer" style="margin-top: 80px;">
              Report compiled automatically by the Textile Waste Intelligence Platform (TWIP).
            </div>
            <div class="page-number">Page 2 of 3</div>
          </div>

          <!-- PAGE 3: RECYCLING METHODS & SUSTAINABLE DISPOSAL -->
          <div class="page">
            <table class="header-table">
              <tr>
                <td class="brand">TWIP</td>
                <td class="title">AI Classification Audit Report (Page 3/3)</td>
              </tr>
            </table>
            <div class="divider"></div>

            <div class="section-title">1. Industrial Recycling Methodologies</div>
            <p style="font-size: 13px; color: #334155; line-height: 1.7; margin-bottom: 20px;">
              ${recyclingMethodsText}
            </p>

            <div class="section-title">2. Processing Materials & Chemical Agents Required</div>
            <p style="font-size: 13px; color: #334155; line-height: 1.7; margin-bottom: 20px;">
              The following solvent systems, mechanical installations, or catalysts are required to process this batch:
            </p>
            <div class="info-box" style="border-left-color: #0f766e; background-color: #f0fdfa; color: #115e59; font-weight: 600;">
              🧪 Chemical / Mechanical Requirements: ${recyclingMaterialsText}
            </div>

            <div class="section-title">3. Environmental Mitigation & Sustainable Disposal Criteria</div>
            <p style="font-size: 13px; color: #334155; line-height: 1.7; margin-bottom: 20px;">
              If the fabric contains high contaminant rates or fiber degradation preventing recycling, follow these sustainable disposal parameters to minimize landfill footprint:
            </p>
            <p style="font-size: 13px; color: #475569; line-height: 1.7;">
              ${disposalText}
            </p>

            <div class="footer" style="margin-top: 60px;">
              Report compiled automatically by the Textile Waste Intelligence Platform (TWIP) on ${new Date().toLocaleString()}.
              Certified environment compliance transcript.
            </div>
            <div class="page-number">Page 3 of 3</div>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setResult(null);
    setError('');
    setShowLocationSelect(false);
    setSaveSuccess(false);
    setQuickQuantity('150.0');
  };

  // Helper colors
  const getScoreColor = (score) => {
    if (score >= 85) return 'text-emerald-600 stroke-emerald-600 bg-emerald-50';
    if (score >= 70) return 'text-primary-600 stroke-primary-600 bg-primary-50';
    if (score >= 55) return 'text-amber-500 stroke-amber-500 bg-amber-50';
    return 'text-red-600 stroke-red-600 bg-red-50';
  };

  return (
    <div className="space-y-6">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">AI Textile Classifier</h1>
          <p className="text-sm text-slate-400 font-semibold mt-1">
            Upload images of textile scraps to analyze composition, recyclability, and color profile.
          </p>
        </div>
        {result && (
          <button
            onClick={handleReset}
            className="self-start flex items-center space-x-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 px-4 py-2 text-sm font-bold border border-slate-200 transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Scan Another</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs font-semibold flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <span>Batch successfully registered in warehouse inventory! Redirecting...</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PANEL 1: Upload Dropzone & Original Image Preview (1 col on lg) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col items-center">
            
            {/* If no image selected: show dropzone */}
            {!previewUrl ? (
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
                className={`w-full py-16 px-4 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center space-y-4 cursor-pointer transition-all ${
                  dragActive ? 'border-primary-500 bg-primary-50/30' : 'border-slate-300 hover:border-primary-400 hover:bg-slate-50/50'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden" 
                />
                <div className="h-14 w-14 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center shadow-inner">
                  <Upload className="h-7 w-7" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-bold text-slate-700">Drag & drop fabric image</p>
                  <p className="text-xs text-slate-400 font-semibold">PNG, JPG, JPEG, WEBP up to 8MB</p>
                </div>
                <button
                  type="button"
                  className="mt-2 text-xs font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-xl transition-all"
                >
                  Browse Files
                </button>
              </div>
            ) : (
              /* If image selected: show preview & scanner */
              <div className="w-full space-y-4">
                <div className="relative rounded-2xl overflow-hidden border border-slate-200/60 bg-slate-900 aspect-square flex items-center justify-center group shadow-inner">
                  <img 
                    src={previewUrl} 
                    alt="Fabric preview" 
                    className={`max-w-full max-h-full object-contain ${scanning ? 'opacity-40' : ''}`}
                  />
                  
                  {/* Scanner overlay effect */}
                  {scanning && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/70 p-4">
                      {/* Laser scanner line */}
                      <div className="absolute left-0 right-0 h-1 bg-primary-500 animate-scan shadow-lg shadow-primary-500"></div>
                      
                      <Sparkles className="h-8 w-8 text-primary-400 animate-pulse mb-3" />
                      <p className="text-sm font-extrabold text-white text-center">{scanStep}</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-1">AI Classification Engine</p>
                    </div>
                  )}

                  {!scanning && !result && (
                    <button 
                      onClick={handleReset}
                      className="absolute top-4 right-4 p-1.5 bg-slate-900/60 hover:bg-red-600 text-white rounded-xl transition-all"
                      title="Clear image"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* File Details metadata */}
                {!scanning && (
                  <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-2 text-xs font-semibold text-slate-600">
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-400 font-medium">Filename</span>
                      <span className="text-slate-800 truncate max-w-[180px]">{selectedFile?.name}</span>
                    </div>
                    {result && (
                      <>
                        <div className="flex justify-between border-b border-slate-100 pb-2">
                          <span className="text-slate-400 font-medium">Dimensions</span>
                          <span className="text-slate-800">{result.dimensions}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 font-medium">Dominant Color</span>
                          <div className="flex items-center space-x-2">
                            <span 
                              className="h-4.5 w-8 rounded-md border border-slate-300 shadow-sm"
                              style={{ backgroundColor: result.dominant_color.hex }}
                            ></span>
                            <span className="text-slate-800">{result.dominant_color.name}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* CTA Action: Analyze */}
                {!scanning && !result && (
                  <button
                    onClick={handleAnalyze}
                    className="w-full flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md shadow-primary-200"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Run AI Classification</span>
                  </button>
                )}

                {/* Quick Categorize to Inventory Action in Left Column (Milestone 2) */}
                {result && !scanning && canModify && result.is_fabric !== false && !result.fabric_type?.includes("Non-Fabric") && (
                  <div className="p-4 border border-slate-100 rounded-2xl bg-primary-50/20 space-y-4">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-800 block font-mono uppercase tracking-wider">Quick Categorize</span>
                      <p className="text-[10px] text-slate-400 font-semibold leading-normal">
                        Save this classified scrap batch directly into warehouse storage.
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Quantity (kg)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={quickQuantity}
                          onChange={(e) => setQuickQuantity(e.target.value)}
                          className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Warehouse Location</label>
                        <select
                          value={selectedLocation}
                          onChange={(e) => setSelectedLocation(e.target.value)}
                          className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-white focus:outline-none"
                        >
                          <option value="1">Main Zone A</option>
                          <option value="2">Recycling Section B</option>
                          <option value="3">Depot Section C</option>
                        </select>
                      </div>
                      
                      <button
                        onClick={handleRegisterInventory}
                        disabled={savingToInventory || saveSuccess}
                        className="w-full flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md shadow-primary-100 disabled:opacity-50"
                      >
                        <BookmarkPlus className="h-4 w-4" />
                        <span>{savingToInventory ? 'Saving...' : 'Add to Inventory'}</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Quick Helper to try with mock data */}
            {!previewUrl && (
              <div className="mt-4 pt-4 border-t border-slate-100 w-full text-center">
                <button
                  type="button"
                  onClick={handleTrySample}
                  className="text-xs font-bold text-slate-500 hover:text-primary-600 flex items-center justify-center space-x-1 mx-auto"
                >
                  <Camera className="h-4 w-4 text-slate-400" />
                  <span>Try with a Sample Textile Image</span>
                </button>
              </div>
            )}

          </div>
        </div>

        {/* PANEL 2: AI Classification Metrics & Recommendations (2 cols on lg) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* If no result: show guidance notice */}
          {!result ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm h-full flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
              <div className="h-16 w-16 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 shadow-inner">
                <Sparkles className="h-8 w-8 text-slate-300" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-base font-bold text-slate-800">Waiting for Scan...</h3>
                <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                  Upload an image of post-consumer scraps, fabric pieces, or apparel rejects and click "Run AI Classification" to analyze textile parameters.
                </p>
              </div>
            </div>
          ) : result.is_fabric === false || result.fabric_type?.includes("Non-Fabric") ? (
            /* NON-FABRIC WARNING CARD */
            <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-8 shadow-sm space-y-6">
              <div className="flex items-center space-x-4 text-red-700 border-b border-red-200 pb-4">
                <div className="p-3 bg-red-100 rounded-2xl">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-red-900 tracking-tight">Not a Fabric Material</h3>
                  <p className="text-xs font-semibold text-red-600 mt-0.5">AI Classification Engine Validation Rejected</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Diagnostic Analysis Result:</h4>
                <p className="text-xs text-slate-700 font-medium leading-relaxed bg-white p-4 rounded-2xl border border-red-100 shadow-sm">
                  {result.categorization_explanation || "CLASSIFICATION REJECTED: The uploaded image does not contain recognizable textile weave patterns, fiber textures, or fabric structure. Please upload a clear photo of a textile fabric, garment scrap, or fiber material."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                <div className="p-3.5 bg-white rounded-2xl border border-red-100 shadow-sm flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Material Status:</span>
                  <span className="text-red-700 font-extrabold bg-red-100 px-2.5 py-1 rounded-full text-[10px]">Non-Textile Matter</span>
                </div>
                <div className="p-3.5 bg-white rounded-2xl border border-red-100 shadow-sm flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Fiber Composition:</span>
                  <span className="text-slate-800 font-bold font-mono text-[10px]">0% Fiber Content</span>
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-xs font-semibold flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Recommendation:</strong> {result.recommendation || "Please upload a clear close-up image of a fabric garment, woven scrap, or fiber roll for circular recycling assessment."}
                </span>
              </div>
            </div>
          ) : (
            /* If result loaded: show visual analysis dashboard */
            <div className="space-y-6">
              
              {/* Dual Panel Top: Score & Fabric Types */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Circular Score Gauge */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col items-center text-center justify-between">
                  <div className="w-full text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Circularity Index</span>
                    <h3 className="text-sm font-bold text-slate-700 mt-0.5">Scoring Model Metrics</h3>
                  </div>

                  {/* SVG Gauge */}
                  <div className="relative h-32 w-32 flex items-center justify-center my-4">
                    <svg className="w-full h-full transform -rotate-90">
                      {/* Grey background circle */}
                      <circle 
                        cx="64" cy="64" r="54" 
                        strokeWidth="10" stroke="#f1f5f9" fill="transparent"
                      />
                      {/* Green foreground circle */}
                      <circle 
                        cx="64" cy="64" r="54" 
                        strokeWidth="10" 
                        fill="transparent"
                        className={`transition-all duration-1000 ${
                          result.circularity_score >= 85 ? 'stroke-emerald-500' :
                          result.circularity_score >= 70 ? 'stroke-primary-500' :
                          result.circularity_score >= 55 ? 'stroke-amber-500' : 'stroke-red-500'
                        }`}
                        strokeDasharray={2 * Math.PI * 54}
                        strokeDashoffset={2 * Math.PI * 54 * (1 - result.circularity_score / 100)}
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-slate-800">{result.circularity_score}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Score</span>
                    </div>
                  </div>

                  <div>
                    <span className={`inline-block border px-3 py-1 rounded-full text-xs font-bold ${getScoreColor(result.circularity_score)}`}>
                      {result.circularity_category}
                    </span>
                  </div>
                </div>

                {/* 2. Fabric Classification and Weave */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">AI Classification</span>
                      <h3 className="text-base font-bold text-slate-800 mt-0.5">{result.fabric_type} Material</h3>
                    </div>
                    
                    <div className="space-y-3 font-semibold text-xs text-slate-600">
                      <div>
                        <div className="flex justify-between text-slate-400 font-medium mb-1">
                          <span>Fiber Composition</span>
                          <span className="text-slate-800">{result.composition}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary-600 rounded-full" style={{ width: `${result.metrics.recyclability}%` }}></div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between border-t border-slate-100 pt-3">
                        <span className="text-slate-400 font-medium">Visual Pattern</span>
                        <span className="text-slate-800">{result.pattern}</span>
                      </div>
                      
                      <div className="flex justify-between border-t border-slate-100 pt-3">
                        <span className="text-slate-400 font-medium">Physical Category</span>
                        <span className="text-slate-800">{result.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <span>Contamination Flag</span>
                    <span className={result.has_contaminants ? 'text-red-600' : 'text-emerald-600'}>
                      {result.has_contaminants ? 'Detected (Wet/Stained)' : 'None Detected'}
                    </span>
                  </div>
                </div>

              </div>

              {/* AI Explainability & Grad-CAM Heatmap Visualizer */}
              {result.explainability && (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-4">
                    <div>
                      <div className="inline-flex items-center space-x-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold mb-1">
                        <Eye className="h-3.5 w-3.5" />
                        <span>Grad-CAM Visual AI Explainability</span>
                      </div>
                      <h3 className="text-base font-extrabold text-slate-800">
                        Feature Attention & Texture Heatmap
                      </h3>
                    </div>
                    
                    {/* Confidence Score Badge & Uncertainty Warning */}
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                        result.explainability.is_uncertain 
                          ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      }`}>
                        {result.explainability.confidence_percentage}% Confidence {result.explainability.is_uncertain ? '(Uncertain)' : '(High)'}
                      </span>
                    </div>
                  </div>

                  {/* Low Confidence Warning Alert */}
                  {result.explainability.is_uncertain && (
                    <div className="p-4 bg-amber-50 border border-amber-300 text-amber-900 rounded-2xl text-xs font-semibold flex items-start space-x-3 shadow-sm">
                      <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-amber-950 block text-sm mb-0.5">⚠️ Model Prediction Uncertainty Warning</strong>
                        <span>
                          {result.explainability.uncertainty_warning || "Confidence score is below 75% threshold. High texture variance detected. Manual sorting and physical lab verification recommended before inventory check-in."}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Side-by-Side Image Visualizer */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Original Image */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Original Upload Image
                      </span>
                      <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 h-64 flex items-center justify-center">
                        <img 
                          src={result.explainability.original_image_base64 || imagePreview} 
                          alt="Original Textile"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>

                    {/* Grad-CAM Heatmap Overlay */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                          Grad-CAM Heatmap Overlay
                        </span>
                        <span className="text-[9px] font-bold text-slate-400">
                          Red/Yellow = High Focus
                        </span>
                      </div>
                      <div className="relative rounded-2xl overflow-hidden border border-indigo-200 bg-slate-900 h-64 flex items-center justify-center">
                        <img 
                          src={result.explainability.heatmap_base64} 
                          alt="Grad-CAM Heatmap Overlay"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Explanation & Active Features */}
                  <div className="space-y-3 pt-2">
                    <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                      {result.explainability.explanation_text}
                    </p>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Activated Micro-Texture Features
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {result.explainability.active_features?.map((feat, idx) => (
                          <span key={idx} className="text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-lg">
                            ✨ {feat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Panel: Details breakdown & Recommendations */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Circular Sourcing Recommendations</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                    {result.recommendation}
                  </p>
                </div>

                {/* Score breakdown metrics list */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 border-t border-slate-100 pt-6">
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Recyclability</span>
                    <span className="text-sm font-black text-slate-800">{result.metrics.recyclability}%</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Condition</span>
                    <span className="text-sm font-black text-slate-800">{result.metrics.condition}%</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Reuse Potential</span>
                    <span className="text-sm font-black text-slate-800">{result.metrics.reuse_potential}%</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Eco Benefit</span>
                    <span className="text-sm font-black text-slate-800">{result.metrics.environmental_benefit}%</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Feasibility</span>
                    <span className="text-sm font-black text-slate-800">{result.metrics.processing_feasibility}%</span>
                  </div>
                </div>

                {/* Actions row: Download Text Report & Download PDF */}
                <div className="border-t border-slate-100 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Download Text Report */}
                    <button
                      type="button"
                      onClick={handleDownloadReport}
                      className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-all shadow-md"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download TXT Report</span>
                    </button>

                    {/* Download PDF Report */}
                    <button
                      type="button"
                      onClick={handleDownloadPDF}
                      className="flex items-center space-x-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-all shadow-md"
                    >
                      <FileText className="h-4 w-4" />
                      <span>Download PDF</span>
                    </button>
                  </div>

                  {/* Register Inventory link section (Restricted to Operators/Admins) */}
                  {canModify && (
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                      {/* Location Select dropdown */}
                      <div className="flex items-center space-x-2 border border-slate-200 rounded-xl px-2.5 py-1.5 bg-slate-50/50">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <select
                          value={selectedLocation}
                          onChange={(e) => setSelectedLocation(e.target.value)}
                          className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
                        >
                          <option value="1">Main Zone A</option>
                          <option value="2">Recycling Section B</option>
                          <option value="3">Depot Section C</option>
                        </select>
                      </div>

                      {/* Submit */}
                      <button
                        onClick={handleRegisterInventory}
                        disabled={savingToInventory || saveSuccess}
                        className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-all shadow-md shadow-primary-200 disabled:opacity-50 disabled:pointer-events-none"
                      >
                        {savingToInventory ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        ) : (
                          <>
                            <BookmarkPlus className="h-4 w-4" />
                            <span>Save to Warehouse</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default MaterialClassificationPage;
