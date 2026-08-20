import PDFDocument from 'pdfkit';
import * as XLSX from 'xlsx';
import { getDb } from './db';
import { ReportConfig } from './types';

export async function generatePdfReport(config: ReportConfig): Promise<Buffer> {
  const db = getDb();

  // Find target analysis if analysisId is passed or embedded in title
  let targetAnalysis = undefined;
  if (config.analysisId) {
    targetAnalysis = db.analyses.find((a) => a.id === config.analysisId);
  }
  if (!targetAnalysis && config.title) {
    const match = config.title.match(/ANL-\d+/i);
    if (match) {
      targetAnalysis = db.analyses.find((a) => a.id.toLowerCase() === match[0].toLowerCase());
    }
  }

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      // Header Banner
      doc.rect(40, 40, 515, 60).fill('#0f172a'); // Navy Slate
      doc.fillColor('#ffffff').fontSize(18).font('Helvetica-Bold').text('TEXTILE WASTE INTELLIGENCE', 55, 50);
      doc.fontSize(9).font('Helvetica').fillColor('#94a3b8').text('Circular Economy & Material Diagnostics Platform', 55, 74);

      if (targetAnalysis) {
        // ==========================================
        // SPECIFIC TEXTILE DIAGNOSTIC REPORT
        // ==========================================
        let curY = 115;
        doc.fillColor('#0f172a').fontSize(15).font('Helvetica-Bold').text(`TEXTILE DIAGNOSTIC REPORT: ${targetAnalysis.id}`, 40, curY);
        
        curY += 22;
        doc.fontSize(9).font('Helvetica').fillColor('#64748b');
        doc.text(`Report ID: RPT-${Date.now().toString().slice(-6)}`, 40, curY);
        doc.text(`Sample Reference: ${targetAnalysis.imageName || 'Textile_Sample.png'}`, 300, curY);
        
        curY += 13;
        doc.text(`Generated Date: ${new Date().toISOString().split('T')[0]}`, 40, curY);
        doc.text(`Batch ID: ${targetAnalysis.batchId || 'Unassigned'}`, 300, curY);
        
        curY += 13;
        doc.text(`Analysis Date: ${targetAnalysis.analyzedAt ? targetAnalysis.analyzedAt.replace('T', ' ').slice(0, 16) : '2026-07-24'}`, 40, curY);
        doc.text(`Waste Category: ${targetAnalysis.wasteCategory}`, 300, curY);

        curY += 13;
        doc.text(`Evaluated By: ${targetAnalysis.analyzedBy || 'AI Diagnostic System'}`, 40, curY);

        // Divider
        curY += 20;
        doc.moveTo(40, curY).lineTo(555, curY).strokeColor('#cbd5e1').lineWidth(1).stroke();

        // Section 1: Detected Material & Fiber Breakdown
        curY += 15;
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#0f172a').text('1. Material Diagnostics & Fiber Composition', 40, curY);

        // Primary Detected Material Box
        curY += 18;
        doc.rect(40, curY, 515, 48).fillAndStroke('#ecfdf5', '#a7f3d0');
        doc.fontSize(8).font('Helvetica-Bold').fillColor('#047857').text('PRIMARY DETECTED MATERIAL', 52, curY + 8);
        doc.fontSize(13).font('Helvetica-Bold').fillColor('#065f46').text(targetAnalysis.detectedMaterial, 52, curY + 22);
        doc.fontSize(8.5).font('Helvetica').fillColor('#047857').text(
          `AI Confidence Score: ${Math.round((targetAnalysis.confidenceScore || 0.95) * 100)}%   |   Category: ${targetAnalysis.wasteCategory}`,
          270, curY + 24
        );

        // Fiber Composition Table
        curY += 58;
        doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#0f172a').text('Fiber Breakdown Composition:', 40, curY);
        
        curY += 15;
        doc.rect(40, curY, 515, 18).fill('#1e293b');
        doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold');
        doc.text('FIBER TYPE', 50, curY + 5);
        doc.text('SHARE (%)', 250, curY + 5);
        doc.text('PURITY GRADE', 380, curY + 5);

        curY += 18;
        const fibers = targetAnalysis.fiberComposition || [{ fiber: 'Cotton', percentage: 100 }];
        fibers.forEach((fc, idx) => {
          const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
          doc.rect(40, curY, 515, 18).fillAndStroke(bg, '#e2e8f0');
          doc.fontSize(8).font('Helvetica').fillColor('#1e293b');
          doc.text(fc.fiber, 50, curY + 5);
          doc.font('Helvetica-Bold').fillColor('#047857').text(`${fc.percentage}%`, 250, curY + 5);
          doc.font('Helvetica').fillColor('#64748b').text(fc.percentage >= 80 ? 'High Purity (Monomaterial)' : 'Blended Fiber', 380, curY + 5);
          curY += 18;
        });

        // Section 2: Visual Diagnostics & Circularity Assessment
        curY += 15;
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#0f172a').text('2. Physical Characteristics & Circularity Assessment', 40, curY);

        curY += 18;
        const vis = targetAnalysis.visualCharacteristics || { texture: 'Woven', pattern: 'Solid', dominantColor: 'Natural', condition: 'Pristine', damageLevel: 'Low', contamination: 'None' };
        const boxHeight = 100;

        // Visual Characteristics Box (Left)
        doc.rect(40, curY, 250, boxHeight).fillAndStroke('#f8fafc', '#cbd5e1');
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#0f172a').text('Visual Characteristics', 48, curY + 8);
        doc.fontSize(8).font('Helvetica').fillColor('#475569');
        doc.text(`Texture: ${vis.texture}`, 48, curY + 24);
        doc.text(`Pattern: ${vis.pattern}`, 48, curY + 38);
        doc.text(`Dominant Color: ${vis.dominantColor}`, 48, curY + 52);
        doc.text(`Condition: ${vis.condition}`, 48, curY + 66);
        doc.text(`Damage Level: ${vis.damageLevel}`, 48, curY + 80);

        // Circularity Box (Right)
        doc.rect(305, curY, 250, boxHeight).fillAndStroke('#f8fafc', '#cbd5e1');
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#0f172a').text('Circularity & Quality Index', 313, curY + 8);
        doc.fontSize(8).font('Helvetica').fillColor('#475569');
        doc.text(`Circularity Score: ${targetAnalysis.circularity?.overallScore || 85} / 100`, 313, curY + 24);
        doc.text(`Recyclability Potential: ${targetAnalysis.recyclability || 'High'}`, 313, curY + 38);
        doc.text(`Reuse Feasibility: ${targetAnalysis.reusePotential || 'Good'}`, 313, curY + 52);
        doc.text(`Contamination Level: ${vis.contamination || 'None'}`, 313, curY + 66);
        doc.text(`NIR Reflectance Peak: ${targetAnalysis.spectrographicSignature?.nirReflectancePeakNm || 1450} nm`, 313, curY + 80);

        curY += boxHeight + 15;

        // Section 3: Recommended Strategy (Dynamic multi-line height calculation)
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#0f172a').text('3. Recommended Circular Recovery Strategy', 40, curY);
        curY += 18;

        const rec = targetAnalysis.recommendation || {
          primary: 'Mechanical Fiber Recycling',
          rationale: 'High purity organic fibers suitable for garnetting.',
          processingMethod: 'Mechanical garnetting and carding',
          expectedEfficiencyPercent: 92,
          suggestedNextSteps: ['Bale sample', 'Route to garnetting line']
        };

        const titleText = rec.primary;
        const methodText = `Processing Method: ${rec.processingMethod} | Expected Efficiency: ${rec.expectedEfficiencyPercent}%`;
        const rationaleText = `Rationale: ${rec.rationale}`;
        const nextStepsText = `Next Steps: ${Array.isArray(rec.suggestedNextSteps) ? rec.suggestedNextSteps.join(', ') : rec.suggestedNextSteps || 'Route to processing facility'}`;

        doc.fontSize(10).font('Helvetica-Bold');
        const hTitle = doc.heightOfString(titleText, { width: 495 });
        
        doc.fontSize(8).font('Helvetica');
        const hMethod = doc.heightOfString(methodText, { width: 495 });
        const hRationale = doc.heightOfString(rationaleText, { width: 495 });
        const hNextSteps = doc.heightOfString(nextStepsText, { width: 495 });

        const recBoxPadding = 12;
        const totalRecHeight = hTitle + hMethod + hRationale + hNextSteps + 20;

        doc.rect(40, curY, 515, totalRecHeight).fillAndStroke('#eff6ff', '#bfdbfe');

        let textY = curY + recBoxPadding;
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#1e40af').text(titleText, 50, textY, { width: 495 });
        textY += hTitle + 4;

        doc.fontSize(8).font('Helvetica').fillColor('#1e3a8a').text(methodText, 50, textY, { width: 495 });
        textY += hMethod + 4;

        doc.text(rationaleText, 50, textY, { width: 495 });
        textY += hRationale + 4;

        doc.text(nextStepsText, 50, textY, { width: 495 });

        curY += totalRecHeight + 15;

        // Section 4: Environmental Impact Summary
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#0f172a').text('4. Estimated Environmental Impact (Per Ton Processed)', 40, curY);
        curY += 18;

        const env = targetAnalysis.environmentalImpact || { co2SavedKg: 3800, waterSavedLiters: 12000, landfillAvoidedKg: 950, materialRecoveryRate: 92 };
        const envBoxes = [
          { label: 'CO2 SAVED', value: `${env.co2SavedKg} kg` },
          { label: 'WATER PRESERVED', value: `${(env.waterSavedLiters / 1000).toFixed(1)} m³` },
          { label: 'LANDFILL DIVERTED', value: `${env.landfillAvoidedKg} kg` },
          { label: 'RECOVERY RATE', value: `${env.materialRecoveryRate}%` }
        ];

        envBoxes.forEach((box, idx) => {
          const x = 40 + idx * 130;
          doc.rect(x, curY, 120, 42).fillAndStroke('#f0fdf4', '#bbf7d0');
          doc.fontSize(7).font('Helvetica-Bold').fillColor('#166534').text(box.label, x + 6, curY + 8);
          doc.fontSize(12).font('Helvetica-Bold').fillColor('#15803d').text(box.value, x + 6, curY + 22);
        });

      } else {
        // ==========================================
        // SYSTEM EXECUTIVE REPORT ACCORDING TO PDF TYPES
        // ==========================================
        let curY = 120;
        const reportTitle = config.title ? config.title.toUpperCase() : 'TEXTILE WASTE INTELLIGENCE EXECUTIVE REPORT';
        doc.fillColor('#0f172a').fontSize(14).font('Helvetica-Bold').text(reportTitle, 40, curY);
        
        curY += 22;
        doc.fontSize(8.5).font('Helvetica').fillColor('#64748b');
        doc.text(`Report ID: RPT-${Date.now().toString().slice(-6)}`, 40, curY);
        doc.text(`Facility Scope: Regional Recycling & Manufacturing Nodes`, 300, curY);
        
        curY += 13;
        doc.text(`Generated Date: ${new Date().toISOString().split('T')[0]}`, 40, curY);
        doc.text(`Time Period: ${config.dateRange.start} to ${config.dateRange.end}`, 300, curY);

        curY += 13;
        doc.text(`Compliance Standard: ISO 14040 / Circular Footprint Model`, 40, curY);
        doc.text(`Data Verification: Verified by AI Multi-Sensor Engine`, 300, curY);

        // Divider line
        curY += 18;
        doc.moveTo(40, curY).lineTo(555, curY).strokeColor('#cbd5e1').lineWidth(1).stroke();

        // Section 1: Executive KPI Summary
        curY += 14;
        doc.fontSize(10.5).font('Helvetica-Bold').fillColor('#0f172a').text('1. Key Operational & Sustainability Metrics', 40, curY);

        curY += 16;
        const metrics = db.systemMetrics;
        const kpiBoxes = [
          { label: 'TOTAL WASTE PROCESSED', value: `${(metrics.totalWasteProcessedKg / 1000).toFixed(1)} Tons` },
          { label: 'ACTIVE BATCHES', value: `${metrics.activeBatchesCount}` },
          { label: 'AVG CIRCULARITY SCORE', value: `${metrics.averageCircularityScore} / 100` },
          { label: 'TOTAL CO2 SAVINGS', value: `${metrics.totalCo2SavedTons} Tons` }
        ];

        kpiBoxes.forEach((box, idx) => {
          const x = 40 + (idx % 2) * 260;
          const y = curY + Math.floor(idx / 2) * 46;
          doc.rect(x, y, 245, 40).fillAndStroke('#f8fafc', '#e2e8f0');
          doc.fontSize(7).font('Helvetica-Bold').fillColor('#64748b').text(box.label, x + 10, y + 7);
          doc.fontSize(12).font('Helvetica-Bold').fillColor('#047857').text(box.value, x + 10, y + 20);
        });

        curY += 102;

        // Tailored Section 2 based on report type:
        if (config.type === 'classification') {
          // WASTE CLASSIFICATION REPORT SECTION
          doc.fontSize(10.5).font('Helvetica-Bold').fillColor('#0f172a').text('2. Textile Waste Classification & Fiber Blend Analysis', 40, curY);
          curY += 16;
          doc.rect(40, curY, 515, 18).fill('#1e293b');
          doc.fillColor('#ffffff').fontSize(7.5).font('Helvetica-Bold');
          doc.text('BATCH / MATERIAL', 45, curY + 5);
          doc.text('CATEGORY', 180, curY + 5);
          doc.text('PURITY / FIBER', 280, curY + 5);
          doc.text('WEIGHT (KG)', 390, curY + 5);
          doc.text('RECYCLABILITY', 465, curY + 5);

          curY += 18;
          db.inventory.slice(0, 8).forEach((item, index) => {
            const bg = index % 2 === 0 ? '#ffffff' : '#f8fafc';
            doc.rect(40, curY, 515, 17).fillAndStroke(bg, '#f1f5f9');
            doc.fontSize(7.5).font('Helvetica').fillColor('#1e293b');
            doc.text(item.materialName.slice(0, 22), 45, curY + 5);
            doc.text(item.category, 180, curY + 5);
            doc.text(item.condition.includes('Grade A') ? 'Grade A Clean' : item.condition.slice(0, 16), 280, curY + 5);
            doc.text(`${item.quantityKg} kg`, 390, curY + 5);
            doc.font('Helvetica-Bold').fillColor('#047857').text(`${item.recyclabilityScore}%`, 465, curY + 5);
            curY += 17;
          });
        } else if (config.type === 'recycling') {
          // RECYCLING & RECOVERY PATHWAYS SECTION
          doc.fontSize(10.5).font('Helvetica-Bold').fillColor('#0f172a').text('2. Circular Recovery Pathways & Facility Routing', 40, curY);
          curY += 16;
          doc.rect(40, curY, 515, 18).fill('#1e293b');
          doc.fillColor('#ffffff').fontSize(7.5).font('Helvetica-Bold');
          doc.text('STRATEGY NAME', 45, curY + 5);
          doc.text('PATHWAY TYPE', 200, curY + 5);
          doc.text('EFFICIENCY', 330, curY + 5);
          doc.text('CO2 SAVINGS', 400, curY + 5);
          doc.text('STATUS', 475, curY + 5);

          curY += 18;
          db.recommendations.slice(0, 8).forEach((rec, index) => {
            const bg = index % 2 === 0 ? '#ffffff' : '#f8fafc';
            doc.rect(40, curY, 515, 17).fillAndStroke(bg, '#f1f5f9');
            doc.fontSize(7.5).font('Helvetica').fillColor('#1e293b');
            doc.text(rec.title.slice(0, 26), 45, curY + 5);
            doc.text(rec.strategyCategory, 200, curY + 5);
            doc.text(`${rec.recoveryEfficiency}%`, 330, curY + 5);
            doc.text(`${rec.co2SavingsPerTon} T/T`, 400, curY + 5);
            doc.font('Helvetica-Bold').fillColor('#047857').text('Optimal', 475, curY + 5);
            curY += 17;
          });
        } else if (config.type === 'environmental') {
          // ENVIRONMENTAL IMPACT & LCA SECTION
          doc.fontSize(10.5).font('Helvetica-Bold').fillColor('#0f172a').text('2. Environmental Footprint Reduction & Virgin Material Displacement', 40, curY);
          curY += 16;
          const envData = [
            { indicator: 'Greenhouse Gas Emissions Avoided (CO2e)', value: `${metrics.totalCo2SavedTons} Tons`, benchmark: '3.8 Tons CO2e / Ton textile diverted' },
            { indicator: 'Freshwater Resource Preservation', value: `${metrics.totalWaterSavedM3.toLocaleString()} m3`, benchmark: '12,000 Liters / Ton cotton displaced' },
            { indicator: 'Solid Landfill Space Conserved', value: `${(metrics.totalWasteProcessedKg * 0.88 / 1000).toFixed(1)} Tons`, benchmark: '88% landfill diversion rate' },
            { indicator: 'Virgin Polyester / Cotton Feedstock Displaced', value: `${(metrics.totalWasteProcessedKg * 0.76 / 1000).toFixed(1)} Tons`, benchmark: '76% closed-loop circular yield' }
          ];
          envData.forEach((row, index) => {
            const bg = index % 2 === 0 ? '#ffffff' : '#f8fafc';
            doc.rect(40, curY, 515, 26).fillAndStroke(bg, '#e2e8f0');
            doc.fontSize(8).font('Helvetica-Bold').fillColor('#0f172a').text(row.indicator, 48, curY + 5);
            doc.fontSize(8).font('Helvetica').fillColor('#64748b').text(`Benchmark: ${row.benchmark}`, 48, curY + 15);
            doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#047857').text(row.value, 420, curY + 8, { align: 'right' });
            curY += 28;
          });
        } else {
          // SUSTAINABILITY & CIRCULARITY SCORING (DEFAULT / CIRCULAR ECONOMY)
          doc.fontSize(10.5).font('Helvetica-Bold').fillColor('#0f172a').text('2. Weighted Circularity Formula & Recovery Performance', 40, curY);
          curY += 14;
          doc.fontSize(7.5).font('Helvetica').fillColor('#475569')
            .text('Mathematical Model: Score = 0.35(Recyclability) + 0.20(Condition) + 0.20(Reuse) + 0.15(EnvBenefit) + 0.10(Feasibility)', 40, curY);
          curY += 15;

          const circularityBreakdown = [
            { dimension: 'Material Recyclability (35% Weight)', score: '88 / 100', status: 'Excellent', notes: 'High purity mono-fiber composition' },
            { dimension: 'Material Condition (20% Weight)', score: '82 / 100', status: 'High', notes: 'Low mechanical wear & minimal damage' },
            { dimension: 'Reuse Potential (20% Weight)', score: '78 / 100', status: 'Good', notes: 'Suitable for secondary garment upcycling' },
            { dimension: 'Environmental Benefit (15% Weight)', score: '94 / 100', status: 'Superior', notes: 'High virgin feedstock displacement' },
            { dimension: 'Processing Feasibility (10% Weight)', score: '85 / 100', status: 'Optimal', notes: 'Regional mechanical garnetting availability' }
          ];

          circularityBreakdown.forEach((dim, idx) => {
            const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
            doc.rect(40, curY, 515, 20).fillAndStroke(bg, '#e2e8f0');
            doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#0f172a').text(dim.dimension, 48, curY + 6);
            doc.fontSize(7.5).font('Helvetica').fillColor('#64748b').text(dim.notes, 250, curY + 6);
            doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#047857').text(dim.score, 450, curY + 6);
            curY += 21;
          });
        }

        curY += 12;

        // Section 3: Strategic Recommendations
        doc.fontSize(10.5).font('Helvetica-Bold').fillColor('#0f172a').text('3. Strategic Action Plan & Quality Verification', 40, curY);
        curY += 14;

        db.recommendations.slice(0, 2).forEach((rec) => {
          const title = rec.title;
          const meta = `Category: ${rec.strategyCategory} | Efficiency: ${rec.recoveryEfficiency}% | CO2 Saved: ${rec.co2SavingsPerTon} T/Ton`;
          const desc = rec.description;

          doc.fontSize(9).font('Helvetica-Bold');
          const hTitle = doc.heightOfString(title, { width: 495 });
          doc.fontSize(7).font('Helvetica');
          const hMeta = doc.heightOfString(meta, { width: 495 });
          const hDesc = doc.heightOfString(desc, { width: 495 });

          const boxH = hTitle + hMeta + hDesc + 14;
          doc.rect(40, curY, 515, boxH).fillAndStroke('#ecfdf5', '#a7f3d0');

          let ty = curY + 6;
          doc.fontSize(9).font('Helvetica-Bold').fillColor('#065f46').text(title, 50, ty, { width: 495 });
          ty += hTitle + 2;

          doc.fontSize(7).font('Helvetica').fillColor('#047857').text(meta, 50, ty, { width: 495 });
          ty += hMeta + 2;

          doc.fontSize(7).font('Helvetica').fillColor('#1e293b').text(desc, 50, ty, { width: 495 });

          curY += boxH + 8;
        });
      }

      // Footer
      doc.fontSize(8).font('Helvetica').fillColor('#94a3b8').text('Confidential - Generated by Textile Waste Intelligence Platform', 40, 780, { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}


export function generateExcelReport(config: ReportConfig): Buffer {
  const db = getDb();
  const workbook = XLSX.utils.book_new();

  // Search for target analysis if passed
  let targetAnalysis = undefined;
  if (config.analysisId) {
    targetAnalysis = db.analyses.find((a) => a.id === config.analysisId);
  }
  if (!targetAnalysis && config.title) {
    const match = config.title.match(/ANL-\d+/i);
    if (match) {
      targetAnalysis = db.analyses.find((a) => a.id.toLowerCase() === match[0].toLowerCase());
    }
  }

  if (targetAnalysis) {
    // Dedicated Sheet for Specific Analysis
    const analysisDetailData = [
      ['SPECIFIC TEXTILE DIAGNOSTIC ANALYSIS DETAIL'],
      ['Analysis ID', targetAnalysis.id],
      ['Detected Material', targetAnalysis.detectedMaterial],
      ['Confidence Score', `${Math.round((targetAnalysis.confidenceScore || 0.95) * 100)}%`],
      ['Waste Category', targetAnalysis.wasteCategory],
      ['Circularity Score', `${targetAnalysis.circularity?.overallScore || 85} / 100`],
      ['Recyclability', targetAnalysis.recyclability],
      ['Reuse Potential', targetAnalysis.reusePotential],
      ['Batch ID', targetAnalysis.batchId || 'Unassigned'],
      ['Analyzed By', targetAnalysis.analyzedBy],
      ['Analyzed At', targetAnalysis.analyzedAt],
      ['Primary Strategy', targetAnalysis.recommendation?.primary],
      ['Processing Method', targetAnalysis.recommendation?.processingMethod],
      ['CO2 Saved (kg)', targetAnalysis.environmentalImpact?.co2SavedKg],
      ['Water Saved (L)', targetAnalysis.environmentalImpact?.waterSavedLiters],
      ['Landfill Diverted (kg)', targetAnalysis.environmentalImpact?.landfillAvoidedKg]
    ];
    const detailSheet = XLSX.utils.aoa_to_sheet(analysisDetailData);
    XLSX.utils.book_append_sheet(workbook, detailSheet, 'Analysis Detail');
  }

  // Sheet 1: Executive Summary
  const summaryData = [
    ['TEXTILE WASTE INTELLIGENCE PLATFORM - REPORT'],
    ['Report Title', config.title],
    ['Report Type', config.type],
    ['Generated Date', new Date().toISOString().split('T')[0]],
    ['Time Frame', `${config.dateRange.start} to ${config.dateRange.end}`],
    [],
    ['METRIC NAME', 'VALUE', 'UNIT'],
    ['Total Waste Processed', db.systemMetrics.totalWasteProcessedKg, 'kg'],
    ['Active Batches', db.systemMetrics.activeBatchesCount, 'batches'],
    ['Overall Recyclability Rate', db.systemMetrics.overallRecyclabilityRate, '%'],
    ['Average Circularity Score', db.systemMetrics.averageCircularityScore, '/ 100'],
    ['Total CO2 Saved', db.systemMetrics.totalCo2SavedTons, 'Tons'],
    ['Total Water Saved', db.systemMetrics.totalWaterSavedM3, 'm3'],
    ['Landfill Diversion Rate', db.systemMetrics.landfillDivertedPercent, '%']
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Executive Summary');

  // Sheet 2: Inventory Items
  const inventoryData = db.inventory.map((item) => ({
    'Inventory ID': item.id,
    'Batch ID': item.batchId,
    'Material Name': item.materialName,
    'Quantity (kg)': item.quantityKg,
    'Category': item.category,
    'Condition Grade': item.condition,
    'Contamination': item.contaminationLevel,
    'Recyclability Score (%)': item.recyclabilityScore,
    'Location': item.storageLocation,
    'Supplier': item.sourceSupplier,
    'Received Date': item.receivedDate,
    'Status': item.status
  }));
  const inventorySheet = XLSX.utils.json_to_sheet(inventoryData);
  XLSX.utils.book_append_sheet(workbook, inventorySheet, 'Inventory Items');

  // Sheet 3: Analyses History
  const analysesData = db.analyses.map((a) => ({
    'Analysis ID': a.id,
    'Detected Material': a.detectedMaterial,
    'Confidence Score': a.confidenceScore,
    'Waste Category': a.wasteCategory,
    'Circularity Score': a.circularity?.overallScore,
    'Primary Recommendation': a.recommendation?.primary,
    'CO2 Saved (kg)': a.environmentalImpact?.co2SavedKg,
    'Water Saved (Liters)': a.environmentalImpact?.waterSavedLiters,
    'Analyzed By': a.analyzedBy,
    'Date': a.analyzedAt ? a.analyzedAt.split('T')[0] : '2026-07-24'
  }));
  const analysisSheet = XLSX.utils.json_to_sheet(analysesData);
  XLSX.utils.book_append_sheet(workbook, analysisSheet, 'Analyses');

  const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return buf;
}
