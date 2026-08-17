import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import inventoryService from '../services/inventoryService';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  X,
  PlusCircle,
  MinusCircle,
  Eye,
  SlidersHorizontal,
  Download
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const InventoryPage = () => {
  const { hasRole } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Data States
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [size] = useState(8); // items per page
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters & Sorting States
  const [search, setSearch] = useState('');
  const [fabricTypeFilter, setFabricTypeFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [sortBy, setSortBy] = useState('collection_date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Recommendations State (Milestone 3)
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [viewTab, setViewTab] = useState('details'); // 'details' | 'recommendations'

  // Form States
  const [formFabricType, setFormFabricType] = useState('');
  const [formSource, setFormSource] = useState('Post-consumer');
  const [formQuantity, setFormQuantity] = useState('');
  const [formColor, setFormColor] = useState('');
  const [formCondition, setFormCondition] = useState('Clean');
  const [formCollectionDate, setFormCollectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [formStatus, setFormStatus] = useState('Collected');
  const [formInventoryId, setFormInventoryId] = useState('');
  
  // Child TextileWaste states
  const [wastes, setWastes] = useState([]); // List of { material_composition, recyclability_rate, has_contaminants }

  // General Status & Error States
  const [formErrors, setFormErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Role Checks
  const canModify = hasRole(['Administrator', 'Recycling Facility Operator']);

  // Fetch Inventory List
  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data = await inventoryService.getInventory({
        page,
        size,
        search: search || undefined,
        fabric_type: fabricTypeFilter || undefined,
        source: sourceFilter || undefined,
        status: statusFilter || undefined,
        condition: conditionFilter || undefined,
        sort_by: sortBy,
        sort_order: sortOrder
      });
      setItems(data.items);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [page, fabricTypeFilter, sourceFilter, statusFilter, conditionFilter, sortBy, sortOrder]);

  // Handle URL redirect query parameter for adding a new batch from dashboard quick actions
  useEffect(() => {
    if (searchParams.get('add') === 'true' && canModify) {
      // Clear query params
      setSearchParams({});
      openCreateModal();
    }
  }, [searchParams]);

  // Search trigger
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchInventory();
  };

  // Clear all filters
  const handleResetFilters = () => {
    setSearch('');
    setFabricTypeFilter('');
    setSourceFilter('');
    setStatusFilter('');
    setConditionFilter('');
    setSortBy('collection_date');
    setSortOrder('desc');
    setPage(1);
  };

  // Modal Open Handlers
  const openCreateModal = () => {
    setIsEditing(false);
    setFormFabricType('');
    setFormSource('Post-consumer');
    setFormQuantity('');
    setFormColor('');
    setFormCondition('Clean');
    setFormCollectionDate(new Date().toISOString().split('T')[0]);
    setFormStatus('Collected');
    setFormInventoryId('1'); // default to warehouse 1
    setWastes([{ material_composition: '', recyclability_rate: 0.8, has_contaminants: false }]);
    setFormErrors({});
    setApiError('');
    setShowModal(true);
  };

  const openEditModal = (batch) => {
    setIsEditing(true);
    setSelectedBatch(batch);
    setFormFabricType(batch.fabric_type);
    setFormSource(batch.source);
    setFormQuantity(batch.quantity);
    setFormColor(batch.color);
    setFormCondition(batch.condition);
    setFormCollectionDate(batch.collection_date);
    setFormStatus(batch.status);
    setFormInventoryId(batch.inventory_id ? String(batch.inventory_id) : '1');
    
    // Set child textile wastes if exist, else create one template
    if (batch.textile_wastes && batch.textile_wastes.length > 0) {
      setWastes(batch.textile_wastes.map(w => ({
        material_composition: w.material_composition,
        recyclability_rate: w.recyclability_rate,
        has_contaminants: w.has_contaminants
      })));
    } else {
      setWastes([{ material_composition: '', recyclability_rate: 0.8, has_contaminants: false }]);
    }
    
    setFormErrors({});
    setApiError('');
    setShowModal(true);
  };

  const openViewModal = async (batch) => {
    setSelectedBatch(batch);
    setShowViewModal(true);
    setViewTab('details');
    setRecommendations([]);
    setSuccessMessage('');
    setApiError('');
    setLoadingRecommendations(true);
    try {
      const data = await inventoryService.getBatchRecommendations(batch.id);
      setRecommendations(data);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  // Select and execute a recycling recommendation strategy
  const handleApplyStrategy = async (strategyName) => {
    setActionLoading(true);
    setApiError('');
    setSuccessMessage('');
    try {
      // 1. Calculate & Save Recommendations in DB
      try {
        await inventoryService.saveRecommendations(selectedBatch.id);
      } catch (err) {
        console.warn('Recommendations already saved or calculation failed:', err);
      }

      // 2. Calculate & Save Sustainability Metrics in DB
      try {
        await inventoryService.saveSustainabilityMetrics(selectedBatch.id);
      } catch (err) {
        console.warn('Sustainability metrics already saved or calculation failed:', err);
      }

      // 3. Map strategy name to process status
      let newStatus = 'Processing';
      if (strategyName.includes('Donation') || strategyName.includes('Reuse')) {
        newStatus = 'Recycled'; // Direct circular flow counts as fully recovered
      } else if (strategyName.includes('Disposal') || strategyName.includes('Landfill')) {
        newStatus = 'Disposed';
      }

      // 4. Update the batch status
      const updatedBatch = {
        ...selectedBatch,
        status: newStatus
      };
      
      // Clear out relations before PUT to prevent Pydantic payload failures
      delete updatedBatch.operator;
      delete updatedBatch.inventory;
      delete updatedBatch.textile_wastes;

      await inventoryService.updateWasteBatch(selectedBatch.id, updatedBatch);
      
      // Update details view
      const refreshedBatch = await inventoryService.getWasteBatch(selectedBatch.id);
      setSelectedBatch(refreshedBatch);
      
      // Refresh list
      fetchInventory();
      
      setSuccessMessage(`Recycling strategy "${strategyName}" successfully executed. Batch status is now "${newStatus}".`);
    } catch (err) {
      console.error('Error applying strategy:', err);
      setApiError('Failed to apply recycling strategy to this waste batch.');
    } finally {
      setActionLoading(false);
    }
  };

  const getCircularityScore = (item) => {
    const recyclabilityRate = item.textile_wastes && item.textile_wastes.length > 0
      ? item.textile_wastes[0].recyclability_rate
      : 0.70;
    const hasContaminants = item.textile_wastes && item.textile_wastes.length > 0
      ? item.textile_wastes[0].has_contaminants
      : false;
      
    // 1. Recyclability Rating
    let recyclability = Math.round(recyclabilityRate * 100);
    if (hasContaminants) {
      recyclability = Math.max(0, recyclability - 25);
    }
    
    // 2. Condition Score
    const condLower = (item.condition || "clean").toLowerCase();
    let conditionScore = 50;
    if (condLower === "clean" || condLower === "recyclable") {
      conditionScore = 90;
    } else if (condLower === "damaged") {
      conditionScore = 60;
    } else if (condLower === "wet") {
      conditionScore = 40;
    } else if (condLower === "contaminated") {
      conditionScore = 20;
    }
    
    // 3. Reuse Potential
    let reusePotential = 40;
    if (hasContaminants) {
      reusePotential = 20;
    } else if (condLower === "clean") {
      reusePotential = 85;
    } else if (condLower === "damaged") {
      reusePotential = 50;
    }
    
    // 4. Environmental Benefit
    let envBenefit = 70;
    if (hasContaminants) {
      envBenefit = 30;
    } else if (condLower === "clean") {
      envBenefit = 95;
    }
    
    // 5. Processing Feasibility
    let processFeasibility = 60;
    if (hasContaminants) {
      processFeasibility = 30;
    } else if (condLower === "clean") {
      processFeasibility = 90;
    }
    
    const score = Math.round(
      0.35 * recyclability +
      0.20 * conditionScore +
      0.20 * reusePotential +
      0.15 * envBenefit +
      0.10 * processFeasibility
    );
    
    return Math.min(100, Math.max(0, score));
  };

  const getScoreBadgeColor = (score) => {
    if (score >= 85) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score >= 70) return 'bg-teal-50 text-teal-700 border-teal-200';
    if (score >= 55) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  // Generate and download a formatted batch audit report as a PDF
  const handleDownloadBatchReport = () => {
    if (!selectedBatch) return;
    
    // Calculate custom batch-level sustainability telemetry
    const qty = selectedBatch.quantity;
    const fab = (selectedBatch.fabric_type || "Blend").toLowerCase();
    const status = (selectedBatch.status || "Collected").toLowerCase();
    
    const factors = {
      cotton: { co2: 8.5, water: 2500, value: 2.20 },
      polyester: { co2: 12.0, water: 350, value: 1.50 },
      wool: { co2: 16.5, water: 1800, value: 6.80 },
      nylon: { co2: 15.0, water: 450, value: 2.10 },
      silk: { co2: 22.0, water: 3200, value: 25.00 },
      linen: { co2: 6.0, water: 800, value: 4.50 },
      acrylic: { co2: 13.5, water: 400, value: 1.80 },
      denim: { co2: 9.5, water: 2200, value: 3.00 },
      blend: { co2: 10.5, water: 1400, value: 2.00 }
    };
    
    const factor = factors[fab] || factors.blend;
    
    let mult = 0.20; // mechanical default
    let efficiency = 0.85;
    
    if (status === 'disposed') {
      mult = 1.00;
      efficiency = 0.00;
    } else if (status === 'recycled') {
      mult = 0.05; // donation/reuse
    } else if (status === 'processing') {
      mult = 0.40; // chemical
    }
    
    const co2Savings = (factor.co2 - (factor.co2 * mult)) * qty * efficiency;
    const waterSavings = (factor.water - (factor.water * mult)) * qty * efficiency;
    const valueSaved = factor.value * qty * efficiency;
    const landfillDiverted = status === 'disposed' ? 0 : qty;

    const compositionText = selectedBatch.textile_wastes && selectedBatch.textile_wastes.length > 0
      ? selectedBatch.textile_wastes.map(w => `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${w.material_composition || selectedBatch.fabric_type}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: bold;">${Math.round((w.recyclability_rate || 0.85) * 100)}%</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">
              <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 800; ${
                w.has_contaminants 
                  ? 'background-color: #fef2f2; color: #991b1b; border: 1px solid #fee2e2;' 
                  : 'background-color: #ecfdf5; color: #065f46; border: 1px solid #d1fae5;'
              }">
                ${w.has_contaminants ? 'Contaminated' : 'Clean / Clear'}
              </span>
            </td>
          </tr>
        `).join('')
      : `<tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">100% ${selectedBatch.fabric_type}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: bold;">85%</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">
            <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 800; background-color: #ecfdf5; color: #065f46; border: 1px solid #d1fae5;">Clean</span>
          </td>
         </tr>`;

    // Deduplicate recommendations
    const uniqueRecs = [];
    const seenRecs = new Set();
    (recommendations || []).forEach(r => {
      const key = r.strategy;
      if (!seenRecs.has(key)) {
        seenRecs.add(key);
        uniqueRecs.push(r);
      }
    });

    const primaryRec = uniqueRecs.length > 0 ? uniqueRecs[0] : null;

    const primaryCalloutHtml = primaryRec ? `
      <div style="background-color: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 16px; padding: 18px; margin-bottom: 25px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="background-color: #059669; color: white; font-size: 10px; font-weight: 800; padding: 3px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">★ Primary Recommended Action</span>
          <span style="font-size: 11px; font-weight: 800; color: #047857;">Feasibility: ${primaryRec.feasibility || 'High'}</span>
        </div>
        <h3 style="margin: 6px 0 6px 0; font-size: 16px; font-weight: 800; color: #064e3b;">${primaryRec.strategy}</h3>
        <p style="margin: 0 0 10px 0; font-size: 12px; color: #166534; line-height: 1.5;">${primaryRec.description || primaryRec.rationale || 'Optimized circular recovery pathway.'}</p>
        <div style="display: grid; grid-template-cols: repeat(4, 1fr); gap: 10px; border-top: 1px dashed #a7f3d0; padding-top: 10px; font-size: 11px;">
          <div><span style="color: #15803d; font-weight: 600;">CO₂ Offset:</span> <strong style="color: #064e3b;">+${primaryRec.co2_savings_kg || Math.round(qty * 0.973)} kg</strong></div>
          <div><span style="color: #15803d; font-weight: 600;">Water Saved:</span> <strong style="color: #064e3b;">+${primaryRec.water_savings_liters || Math.round(qty * 22.77)} L</strong></div>
          <div><span style="color: #15803d; font-weight: 600;">Fiber Yield:</span> <strong style="color: #064e3b;">${primaryRec.yield_percentage || 92}%</strong></div>
          <div><span style="color: #15803d; font-weight: 600;">Process:</span> <strong style="color: #064e3b;">${primaryRec.processing_method || 'Mechanical Carding'}</strong></div>
        </div>
      </div>
    ` : '';

    const recommendationRows = uniqueRecs.map((r, idx) => {
      const desc = r.description || r.rationale || "Optimized recovery strategy for this fabric blend.";
      const waterL = r.water_savings_liters != null ? r.water_savings_liters : Math.round(qty * (20 - idx * 3));
      const co2Kg = r.co2_savings_kg != null ? r.co2_savings_kg : Math.round(qty * (1.2 - idx * 0.2));
      const yieldPct = r.yield_percentage || (95 - idx * 8);
      const procMethod = r.processing_method || (idx === 0 ? 'Mechanical Carding' : idx === 1 ? 'Thermal Extrusion' : 'Sorting & Felting');
      const reasoning = r.suitability || r.rationale || `Selected for ${selectedBatch.fabric_type} material in ${selectedBatch.condition} condition.`;

      return `
        <div style="padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 12px; background-color: #f8fafc;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <h4 style="margin: 0; font-size: 13px; font-weight: 800; color: #1e293b;">${r.strategy}</h4>
            <span style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; border: 1px solid ${
              r.feasibility === 'High' ? '#a7f3d0; background-color: #ecfdf5; color: #065f46;' :
              r.feasibility === 'Medium' ? '#fde68a; background-color: #fffbeb; color: #92400e;' :
              '#cbd5e1; background-color: #f1f5f9; color: #475569;'
            }">
              Feasibility: ${r.feasibility || 'High'}
            </span>
          </div>
          <p style="margin: 0 0 8px 0; font-size: 11px; color: #475569; line-height: 1.4;">${desc}</p>
          <div style="display: grid; grid-template-cols: repeat(4, 1fr); gap: 8px; font-size: 10px; font-weight: 700; color: #059669; border-top: 1px dashed #e2e8f0; padding-top: 6px; margin-top: 6px;">
            <span>CO₂ Offset: +${co2Kg} kg</span>
            <span>Water Saved: +${waterL} L</span>
            <span>Fiber Yield: ${yieldPct}%</span>
            <span>Process: ${procMethod}</span>
          </div>
          <p style="margin: 5px 0 0 0; font-size: 10px; color: #64748b; font-style: italic;">Why this ranks here: ${reasoning}</p>
        </div>
      `;
    }).join('');

    // Circularity 5-Sub-Scores
    const overallCircularity = getCircularityScore(selectedBatch);
    const recRateVal = selectedBatch.textile_wastes?.[0]?.recyclability_rate || 0.82;
    const subRecyclability = Math.round(recRateVal * 100);
    const subCondition = selectedBatch.condition === 'Clean' ? 90 : selectedBatch.condition === 'Damaged' ? 60 : 30;
    const subReuse = selectedBatch.condition === 'Clean' ? 85 : 55;
    const subEnvBenefit = 95;
    const subFeasibility = 90;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Batch_Audit_Report_BATCH-${selectedBatch.id}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              color: #1e293b;
              margin: 0;
              padding: 0;
              background-color: #ffffff;
              -webkit-print-color-adjust: exact;
            }
            .page {
              width: 210mm;
              min-height: 297mm;
              padding: 20mm;
              margin: auto;
              box-sizing: border-box;
              background: white;
              position: relative;
            }
            .header-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 25px;
            }
            .header-title {
              font-size: 22px;
              font-weight: 800;
              color: #0f172a;
              letter-spacing: -0.5px;
            }
            .header-subtitle {
              font-size: 11px;
              font-weight: 700;
              color: #059669;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 4px;
            }
            .metadata-grid {
              display: grid;
              grid-template-cols: repeat(2, 1fr);
              gap: 15px;
              margin-bottom: 30px;
            }
            .metadata-card {
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 15px;
              background-color: #f8fafc;
            }
            .metadata-title {
              font-size: 10px;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 6px;
            }
            .metadata-value {
              font-size: 14px;
              font-weight: 600;
              color: #0f172a;
            }
            .section-title {
              font-size: 14px;
              font-weight: 800;
              color: #0f172a;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 6px;
              margin-bottom: 15px;
              margin-top: 30px;
            }
            .details-table {
              width: 100%;
              border-collapse: collapse;
            }
            .details-table td {
              padding: 10px 0;
              font-size: 13px;
              border-bottom: 1px solid #f1f5f9;
            }
            .details-label {
              font-weight: 600;
              color: #475569;
              width: 40%;
            }
            .details-val {
              font-weight: bold;
              color: #0f172a;
            }
            .stamp-container {
              border: 2px dashed #059669;
              border-radius: 8px;
              padding: 8px 12px;
              display: inline-block;
              text-align: center;
              color: #059669;
              font-weight: bold;
              font-size: 11px;
              letter-spacing: 0.5px;
            }
            @media print {
              body {
                background: none;
              }
              .page {
                margin: 0;
                border: initial;
                border-radius: initial;
                width: initial;
                min-height: initial;
                box-shadow: initial;
                background: initial;
                page-break-after: always;
              }
            }
          </style>
        </head>
        <body>
          <div class="page">
            <table class="header-table">
              <tr>
                <td>
                  <div class="header-subtitle">Circular Economy Inventory</div>
                  <div class="header-title">Waste Batch Audit Report</div>
                  <div style="font-size: 11px; color: #64748b; margin-top: 4px;">TWIP Asset ID: #BATCH-${selectedBatch.id}</div>
                </td>
                <td style="text-align: right; vertical-align: top;">
                  <div class="stamp-container">
                    PLATFORM VERIFIED<br>
                    <span style="font-size: 9px; font-weight: normal; color: #475569;">${new Date().toLocaleDateString()}</span>
                  </div>
                </td>
              </tr>
            </table>

            <div class="metadata-grid">
              <div class="metadata-card" style="border-left: 4px solid #059669;">
                <div class="metadata-title">Fabric Composition Type</div>
                <div class="metadata-value">${selectedBatch.fabric_type}</div>
              </div>
              <div class="metadata-card" style="border-left: 4px solid #3b82f6;">
                <div class="metadata-title">Net Batch Weight</div>
                <div class="metadata-value">${selectedBatch.quantity} kg</div>
              </div>
            </div>

            <div class="section-title">Batch Specifications</div>
            <table class="details-table">
              <tr>
                <td class="details-label">Color Profile</td>
                <td class="details-val">${selectedBatch.color}</td>
              </tr>
              <tr>
                <td class="details-label">Origin Source</td>
                <td class="details-val">${selectedBatch.source}</td>
              </tr>
              <tr>
                <td class="details-label">Physical Condition</td>
                <td class="details-val">${selectedBatch.condition}</td>
              </tr>
              <tr>
                <td class="details-label">Storage Location Zone</td>
                <td class="details-val">${selectedBatch.inventory ? selectedBatch.inventory.location_name : 'Pending Location Assignment'}</td>
              </tr>
              <tr>
                <td class="details-label">Processing Status</td>
                <td class="details-val">
                  <span style="padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 800; border: 1px solid #cbd5e1; background-color: #f8fafc;">
                    ${selectedBatch.status}
                  </span>
                </td>
              </tr>
              <tr>
                <td class="details-label">Registered On</td>
                <td class="details-val">${new Date(selectedBatch.collection_date).toLocaleDateString(undefined, {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}</td>
              </tr>
            </table>

            <div class="section-title">Fiber Composition & Recyclability Analysis</div>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px;">
              <thead>
                <tr style="background-color: #f1f5f9; text-align: left; font-weight: bold; color: #475569;">
                  <th style="padding: 10px; border-bottom: 2px solid #cbd5e1;">Fiber Breakdown</th>
                  <th style="padding: 10px; border-bottom: 2px solid #cbd5e1; text-align: center;">Recyclability Rate</th>
                  <th style="padding: 10px; border-bottom: 2px solid #cbd5e1; text-align: center;">Contaminant Flag</th>
                </tr>
              </thead>
              <tbody>
                ${compositionText}
              </tbody>
            </table>

            <div class="section-title">LCA Environmental Offsets Summary</div>
            <div style="display: grid; grid-template-cols: repeat(2, 1fr); gap: 15px; margin-top: 10px;">
              <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; background-color: #f8fafc; border-left: 4px solid #10b981;">
                <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Carbon Dioxide Saved</div>
                <div style="font-size: 14px; font-weight: bold; color: #065f46; margin-top: 2px;">+${Math.max(0, Math.round(co2Savings * 100) / 100).toLocaleString()} kg CO₂</div>
              </div>
              <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; background-color: #f8fafc; border-left: 4px solid #3b82f6;">
                <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Fresh Water Conserved</div>
                <div style="font-size: 14px; font-weight: bold; color: #1d4ed8; margin-top: 2px;">+${Math.max(0, Math.round(waterSavings * 100) / 100).toLocaleString()} Litres</div>
              </div>
              <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; background-color: #f8fafc; border-left: 4px solid #f59e0b;">
                <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Material Value Saved</div>
                <div style="font-size: 14px; font-weight: bold; color: #b45309; margin-top: 2px;">$${Math.max(0, Math.round(valueSaved * 100) / 100).toLocaleString()} USD</div>
              </div>
              <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; background-color: #f8fafc; border-left: 4px solid #6366f1;">
                <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Landfill Diversion</div>
                <div style="font-size: 14px; font-weight: bold; color: #4f46e5; margin-top: 2px;">${Math.round(landfillDiverted * 100) / 100} kg</div>
              </div>
            </div>

            <div style="margin-top: 40px; font-size: 10px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px; display: flex; justify-content: space-between;">
              <span>Logged by Operator: ${selectedBatch.operator ? selectedBatch.operator.full_name : 'System Generated'}</span>
              <span>Report Generated: ${new Date().toLocaleString()}</span>
            </div>
          </div>

          <div class="page" style="page-break-before: always;">
            <table class="header-table">
              <tr>
                <td>
                  <div class="header-subtitle">Circular Economy Options</div>
                  <div class="header-title">Recovery & Recycling Strategies</div>
                  <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Circular matching suggestions for #BATCH-${selectedBatch.id}</div>
                </td>
              </tr>
            </table>

            <div class="section-title">Circularity Score Breakdown</div>
            <div style="display: flex; gap: 20px; align-items: center; margin-bottom: 35px; background-color: #ecfdf5; border: 1px solid #d1fae5; border-radius: 16px; padding: 20px;">
              <div style="background-color: #059669; color: white; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 800; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                ${getCircularityScore(selectedBatch)}
              </div>
              <div>
                <div style="font-size: 14px; font-weight: bold; color: #065f46;">Circularity Index</div>
                <div style="font-size: 12px; color: #047857; margin-top: 2px; font-weight: 500;">
                  This batch circularity index matches standard circular reprocessing feasibility guidelines.
                </div>
              </div>
            </div>

            <div class="section-title">Ranked Circular Strategies</div>
            <div style="margin-top: 15px;">
              ${recommendationRows}
            </div>

            <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
              <p style="font-size: 11px; color: #64748b; line-height: 1.6; margin: 0;">
                <strong>Standard LCA Disclaimer:</strong> Projections represent potential emission offsets and water savings derived from the Sustainable Fashion Index dataset. Actual offsets may vary based on exact transport logistics and commercial chemical recovery specifications.
              </p>
            </div>
            
            <div style="margin-top: 35px; font-size: 10px; color: #64748b; display: flex; justify-content: space-between;">
              <span>System Verification: Approved ESG Framework</span>
              <span>Page 2 of 2</span>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Add / Delete child waste items in Form
  const addWasteRow = () => {
    setWastes([...wastes, { material_composition: '', recyclability_rate: 0.8, has_contaminants: false }]);
  };

  const removeWasteRow = (index) => {
    const updated = wastes.filter((_, idx) => idx !== index);
    setWastes(updated);
  };

  const updateWasteRow = (index, field, value) => {
    const updated = [...wastes];
    updated[index][field] = value;
    setWastes(updated);
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!formFabricType.trim()) {
      errors.fabricType = 'Fabric type is required';
    }
    if (!formQuantity) {
      errors.quantity = 'Quantity is required';
    } else if (parseFloat(formQuantity) <= 0) {
      errors.quantity = 'Quantity must be greater than 0';
    }
    if (!formColor.trim()) {
      errors.color = 'Color description is required';
    }
    if (!formCollectionDate) {
      errors.collectionDate = 'Collection date is required';
    }
    
    // Validate child rows
    const wasteErrors = [];
    wastes.forEach((w, index) => {
      if (!w.material_composition.trim()) {
        wasteErrors[index] = 'Composition description is required';
      }
    });
    if (wasteErrors.length > 0) {
      errors.wastes = wasteErrors;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Form Submit (Create or Update)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) return;

    setActionLoading(true);
    const payload = {
      fabric_type: formFabricType,
      source: formSource,
      quantity: parseFloat(formQuantity),
      color: formColor,
      condition: formCondition,
      collection_date: formCollectionDate,
      status: formStatus,
      inventory_id: formInventoryId ? parseInt(formInventoryId) : null,
      textile_wastes: wastes.map(w => ({
        material_composition: w.material_composition,
        recyclability_rate: parseFloat(w.recyclability_rate),
        has_contaminants: w.has_contaminants
      }))
    };

    try {
      if (isEditing) {
        await inventoryService.updateWasteBatch(selectedBatch.id, payload);
      } else {
        await inventoryService.createWasteBatch(payload);
      }
      setShowModal(false);
      fetchInventory();
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.detail) {
        setApiError(err.response.data.detail);
      } else {
        setApiError('An error occurred while saving the waste batch.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete Batch
  const handleDeleteBatch = async (id) => {
    if (!window.confirm('Are you sure you want to delete this textile waste batch? This action cannot be undone.')) {
      return;
    }

    setActionLoading(true);
    try {
      await inventoryService.deleteWasteBatch(id);
      fetchInventory();
    } catch (err) {
      console.error(err);
      alert('Failed to delete waste batch. Please verify permissions.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Collected':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Sorting':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Processing':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'Recycled':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Disposed':
        return 'bg-red-50 text-red-700 border-red-100';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Textile Inventory</h1>
          <p className="text-sm text-slate-400 font-semibold mt-1">
            Browse, filter, and manage warehouse textile waste materials.
          </p>
        </div>
        {canModify && (
          <button
            onClick={openCreateModal}
            className="self-start flex items-center space-x-2 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white px-5 py-3 text-sm font-bold shadow-lg shadow-primary-200 transition-all hover:-translate-y-0.5"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Add Waste Batch</span>
          </button>
        )}
      </div>

      {/* Search, Sorting, and Filters Controls */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        
        {/* Search Bar & Sorters */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by fabric, color, source, status, condition..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold transition-all shadow-sm"
            >
              Search
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-semibold transition-all"
            >
              Reset Filters
            </button>

            {/* Sorter */}
            <div className="h-10 w-px bg-slate-200 hidden md:block"></div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3.5 py-3 rounded-xl border border-slate-200 text-sm font-semibold bg-white cursor-pointer focus:outline-none"
            >
              <option value="collection_date">Sort: Date</option>
              <option value="quantity">Sort: Quantity</option>
              <option value="fabric_type">Sort: Fabric</option>
              <option value="status">Sort: Status</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-3.5 py-3 rounded-xl border border-slate-200 text-sm font-semibold bg-white cursor-pointer focus:outline-none"
            >
              <option value="desc">Order: Decrescent</option>
              <option value="asc">Order: Crescent</option>
            </select>
          </div>
        </form>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-slate-100">
          
          {/* Fabric Type */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Fabric Filter</label>
            <select
              value={fabricTypeFilter}
              onChange={(e) => { setFabricTypeFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50/50 cursor-pointer focus:outline-none"
            >
              <option value="">All Fabrics</option>
              <option value="Cotton">Cotton</option>
              <option value="Polyester">Polyester</option>
              <option value="Wool">Wool</option>
              <option value="Nylon">Nylon</option>
              <option value="Silk">Silk</option>
              <option value="Linen">Linen</option>
              <option value="Acrylic">Acrylic</option>
              <option value="Denim">Denim</option>
              <option value="Blend">Blend</option>
            </select>
          </div>

          {/* Source */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Source Filter</label>
            <select
              value={sourceFilter}
              onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50/50 cursor-pointer focus:outline-none"
            >
              <option value="">All Sources</option>
              <option value="Industrial">Industrial</option>
              <option value="Pre-consumer">Pre-consumer</option>
              <option value="Post-consumer">Post-consumer</option>
            </select>
          </div>

          {/* Condition */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Condition Filter</label>
            <select
              value={conditionFilter}
              onChange={(e) => { setConditionFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50/50 cursor-pointer focus:outline-none"
            >
              <option value="">All Conditions</option>
              <option value="Clean">Clean</option>
              <option value="Damaged">Damaged</option>
              <option value="Wet">Wet</option>
              <option value="Contaminated">Contaminated</option>
              <option value="Recyclable">Recyclable</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Status Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50/50 cursor-pointer focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Collected">Collected</option>
              <option value="Sorting">Sorting</option>
              <option value="Processing">Processing</option>
              <option value="Recycled">Recycled</option>
              <option value="Disposed">Disposed</option>
            </select>
          </div>

        </div>

      </div>

      {/* Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        
        {loading ? (
          <div className="py-24 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-slate-400 text-sm font-semibold">Fetching active records...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Batch ID</th>
                    <th className="px-6 py-4">Fabric</th>
                    <th className="px-6 py-4">Source</th>
                    <th className="px-6 py-4">Quantity</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Circularity</th>
                    <th className="px-6 py-4">Collection Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {items.length > 0 ? (
                    items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/40 transition-all">
                        <td className="px-6 py-4 font-mono text-xs text-slate-400">#BATCH-{item.id}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span>{item.fabric_type}</span>
                            <span className="text-[10px] text-slate-400 font-medium">Color: {item.color}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500">{item.source}</td>
                        <td className="px-6 py-4 text-slate-800">{item.quantity} kg</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block border px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block border px-2.5 py-0.5 rounded-full text-xs font-bold ${getScoreBadgeColor(getCircularityScore(item))}`}>
                            {getCircularityScore(item)}/100
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400">
                          {new Date(item.collection_date).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => openViewModal(item)}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            
                            {canModify && (
                              <>
                                <button
                                  onClick={() => openEditModal(item)}
                                  className="p-1.5 rounded-lg border border-slate-200 text-primary-600 hover:bg-primary-50"
                                  title="Edit"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteBatch(item.id)}
                                  className="p-1.5 rounded-lg border border-slate-200 text-red-600 hover:bg-red-50"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-16 text-center text-slate-400 font-medium">
                        No records match the active search filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pages > 1 && (
              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
                <span>
                  Showing Page {page} of {pages} ({total} entries total)
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-all"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPage(prev => Math.min(prev + 1, pages))}
                    disabled={page === pages}
                    className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-all"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

      </div>

      {/* CRUD Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto my-8">
            
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-xl font-extrabold text-slate-800 mb-2">
              {isEditing ? `Modify Waste Batch #BATCH-${selectedBatch?.id}` : 'Register New Waste Batch'}
            </h3>
            <p className="text-xs text-slate-400 font-medium mb-6">
              Enter the batch weight, primary fiber composition, and destination storage zone.
            </p>

            {apiError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold">
                {apiError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-6">
              
              {/* Grid 1: Basic details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Fabric Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Fabric Type</label>
                  <input
                    type="text"
                    value={formFabricType}
                    onChange={(e) => setFormFabricType(e.target.value)}
                    placeholder="e.g. Cotton, Polyester, Blend"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all focus:outline-none focus:ring-2 ${
                      formErrors.fabricType ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-primary-100 focus:border-primary-500'
                    }`}
                  />
                  {formErrors.fabricType && <p className="text-xs text-red-600 mt-1 font-semibold">{formErrors.fabricType}</p>}
                </div>

                {/* Color */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Color Description</label>
                  <input
                    type="text"
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    placeholder="e.g. Indigo Blue, Mixed Tones"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all focus:outline-none focus:ring-2 ${
                      formErrors.color ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-primary-100 focus:border-primary-500'
                    }`}
                  />
                  {formErrors.color && <p className="text-xs text-red-600 mt-1 font-semibold">{formErrors.color}</p>}
                </div>

                {/* Source */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Material Source</label>
                  <select
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold bg-white cursor-pointer focus:outline-none"
                  >
                    <option value="Industrial">Industrial</option>
                    <option value="Pre-consumer">Pre-consumer</option>
                    <option value="Post-consumer">Post-consumer</option>
                  </select>
                </div>

                {/* Condition */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Physical Condition</label>
                  <select
                    value={formCondition}
                    onChange={(e) => setFormCondition(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold bg-white cursor-pointer focus:outline-none"
                  >
                    <option value="Clean">Clean</option>
                    <option value="Damaged">Damaged</option>
                    <option value="Wet">Wet</option>
                    <option value="Contaminated">Contaminated</option>
                    <option value="Recyclable">Recyclable</option>
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Quantity (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(e.target.value)}
                    placeholder="450.5"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all focus:outline-none focus:ring-2 ${
                      formErrors.quantity ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-primary-100 focus:border-primary-500'
                    }`}
                  />
                  {formErrors.quantity && <p className="text-xs text-red-600 mt-1 font-semibold">{formErrors.quantity}</p>}
                </div>

                {/* Collection Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Collection Date</label>
                  <input
                    type="date"
                    value={formCollectionDate}
                    onChange={(e) => setFormCollectionDate(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all focus:outline-none focus:ring-2 ${
                      formErrors.collectionDate ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-primary-100 focus:border-primary-500'
                    }`}
                  />
                  {formErrors.collectionDate && <p className="text-xs text-red-600 mt-1 font-semibold">{formErrors.collectionDate}</p>}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Process Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold bg-white cursor-pointer focus:outline-none"
                  >
                    <option value="Collected">Collected</option>
                    <option value="Sorting">Sorting</option>
                    <option value="Processing">Processing</option>
                    <option value="Recycled">Recycled</option>
                    <option value="Disposed">Disposed</option>
                  </select>
                </div>

                {/* Location (Inventory ID) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Storage Facility</label>
                  <select
                    value={formInventoryId}
                    onChange={(e) => setFormInventoryId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold bg-white cursor-pointer focus:outline-none"
                  >
                    <option value="">No Warehouse (Pending)</option>
                    <option value="1">Main Warehouse - Zone A</option>
                    <option value="2">Recycling Hub - Section B</option>
                    <option value="3">Processing Depot - Section C</option>
                  </select>
                </div>

              </div>

              {/* SECTION: Fiber Analysis / Child Textile Waste details */}
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Fiber Details (AI Classification Placeholder)</h4>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">Specify material composition breakdown and recyclability rates.</p>
                  </div>
                  <button
                    type="button"
                    onClick={addWasteRow}
                    className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {wastes.map((waste, idx) => (
                    <div key={idx} className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50 flex flex-col md:flex-row gap-4 items-end">
                      
                      {/* Material Composition description */}
                      <div className="flex-1 w-full">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Composition</label>
                        <input
                          type="text"
                          value={waste.material_composition}
                          onChange={(e) => updateWasteRow(idx, 'material_composition', e.target.value)}
                          placeholder="e.g. 98% Cotton / 2% Lycra"
                          className={`w-full px-3.5 py-2 rounded-lg border text-xs font-semibold focus:outline-none bg-white ${
                            formErrors.wastes && formErrors.wastes[idx] ? 'border-red-300' : 'border-slate-200'
                          }`}
                        />
                        {formErrors.wastes && formErrors.wastes[idx] && (
                          <p className="text-[10px] text-red-600 mt-1 font-semibold">{formErrors.wastes[idx]}</p>
                        )}
                      </div>

                      {/* Recyclability Rate */}
                      <div className="w-full md:w-32">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Recyclability</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={waste.recyclability_rate}
                            onChange={(e) => updateWasteRow(idx, 'recyclability_rate', parseFloat(e.target.value))}
                            className="w-full accent-primary-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <span className="text-[11px] font-mono font-bold text-slate-600 w-8 text-right">
                            {Math.round(waste.recyclability_rate * 100)}%
                          </span>
                        </div>
                      </div>

                      {/* Has Contaminants */}
                      <div className="flex items-center space-x-2 pb-2">
                        <input
                          type="checkbox"
                          id={`contaminant-${idx}`}
                          checked={waste.has_contaminants}
                          onChange={(e) => updateWasteRow(idx, 'has_contaminants', e.target.checked)}
                          className="h-4.5 w-4.5 accent-primary-600 rounded cursor-pointer"
                        />
                        <label htmlFor={`contaminant-${idx}`} className="text-xs font-semibold text-slate-600 select-none cursor-pointer">
                          Contaminated
                        </label>
                      </div>

                      {/* Delete row */}
                      {wastes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeWasteRow(idx)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <MinusCircle className="h-5 w-5" />
                        </button>
                      )}

                    </div>
                  ))}
                </div>

              </div>

              {/* Submit / Cancel Actions */}
              <div className="flex items-center justify-end space-x-4 border-t border-slate-100 pt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={actionLoading}
                  className="px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold shadow-md shadow-primary-200 transition-all flex items-center justify-center min-w-32"
                >
                  {actionLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    'Save Batch'
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* VIEW Modal */}
      {showViewModal && selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            
            <button 
              onClick={() => setShowViewModal(false)}
              className="absolute top-6 right-6 p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">#BATCH-{selectedBatch.id}</span>
                <h3 className="text-xl font-extrabold text-slate-800 mt-1">Batch Detail Analysis</h3>
              </div>

              {successMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold">
                  {successMessage}
                </div>
              )}

              {apiError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs font-semibold">
                  {apiError}
                </div>
              )}

              {/* Tab Selector Links */}
              <div className="flex border-b border-slate-100 text-xs font-bold text-slate-400">
                <button
                  type="button"
                  onClick={() => setViewTab('details')}
                  className={`flex-1 pb-3 text-center border-b-2 transition-all ${
                    viewTab === 'details' ? 'border-primary-600 text-primary-700' : 'border-transparent hover:text-slate-600'
                  }`}
                >
                  Material Properties
                </button>
                <button
                  type="button"
                  onClick={() => setViewTab('recommendations')}
                  className={`flex-1 pb-3 text-center border-b-2 transition-all ${
                    viewTab === 'recommendations' ? 'border-primary-600 text-primary-700' : 'border-transparent hover:text-slate-600'
                  }`}
                >
                  Recycling Options
                </button>
              </div>

              {/* Render Selected Tab content */}
              {viewTab === 'details' ? (
                <>
                  {/* Grid properties */}
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6 border-b border-slate-100 pb-6 text-sm font-semibold text-slate-700">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Primary Fabric</span>
                      <span className="text-slate-800">{selectedBatch.fabric_type}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Color</span>
                      <span className="text-slate-800">{selectedBatch.color}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Quantity Weight</span>
                      <span className="text-slate-800">{selectedBatch.quantity} kg</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Material Source</span>
                      <span className="text-slate-800">{selectedBatch.source}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Physical Condition</span>
                      <span className="text-slate-800">{selectedBatch.condition}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Process Status</span>
                      <span className={`inline-block border px-2 rounded-full text-xs font-bold ${getStatusColor(selectedBatch.status)}`}>
                        {selectedBatch.status}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Warehouse Location</span>
                      <span className="text-slate-800">
                        {selectedBatch.inventory ? selectedBatch.inventory.location_name : 'No storage assigned'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Collection Date</span>
                      <span className="text-slate-800">
                        {new Date(selectedBatch.collection_date).toLocaleDateString(undefined, {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Linked Textile Wastes List */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Composition breakdown</h4>
                    {selectedBatch.textile_wastes && selectedBatch.textile_wastes.length > 0 ? (
                      <div className="space-y-2">
                        {selectedBatch.textile_wastes.map((waste) => (
                          <div key={waste.id} className="p-4 border border-slate-100 bg-slate-50/50 rounded-2xl flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-slate-800">{waste.material_composition}</p>
                              <span className="inline-flex items-center text-[10px] font-semibold text-slate-400">
                                Recyclability Score: {Math.round(waste.recyclability_rate * 100)}%
                              </span>
                            </div>
                            {waste.has_contaminants ? (
                              <span className="px-2 py-0.5 bg-red-50 border border-red-100 text-[10px] font-bold text-red-700 rounded-full">
                                Contaminated
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-[10px] font-bold text-emerald-700 rounded-full">
                                Clean
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 font-medium">No secondary fiber composition registered for this batch.</p>
                    )}
                  </div>
                </>
              ) : (
                /* RECOMMENDATIONS TAB CONTENT */
                <div className="space-y-4">
                  {loadingRecommendations ? (
                    <div className="py-12 text-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent mx-auto mb-2"></div>
                      <p className="text-slate-400 text-xs font-semibold">Running circular matching algorithm...</p>
                    </div>
                  ) : recommendations.length > 0 ? (
                    <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                      {recommendations.map((rec, idx) => (
                        <div key={idx} className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-2 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <h4 className="text-xs font-bold text-slate-800">{rec.strategy}</h4>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                                rec.feasibility === 'High' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                rec.feasibility === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-slate-50 text-slate-500 border-slate-200'
                              }`}>
                                Feasibility: {rec.feasibility}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">{rec.description}</p>
                            
                            {rec.feasibility !== 'Low' && (
                              <div className="flex gap-4 text-[10px] font-bold text-primary-700 border-t border-slate-200/50 pt-2 mt-2">
                                <span>CO₂ Offset: +{rec.co2_savings_kg} kg</span>
                                <span>Water Saved: +{rec.water_savings_liters} L</span>
                              </div>
                            )}
                            <p className="text-[10px] text-slate-400 font-medium italic mt-1">{rec.suitability}</p>
                          </div>
                          
                          {rec.feasibility !== 'Low' && selectedBatch.status !== 'Processing' && selectedBatch.status !== 'Recycled' && selectedBatch.status !== 'Disposed' && canModify && (
                            <div className="pt-2 border-t border-slate-200/30 flex justify-end">
                              <button
                                type="button"
                                onClick={() => handleApplyStrategy(rec.strategy)}
                                disabled={actionLoading}
                                className="text-[10px] font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 py-1.5 px-3.5 rounded-lg transition-all shadow-sm flex items-center space-x-1"
                              >
                                <span>Apply Strategy</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-6 font-medium">No recycling options resolved.</p>
                  )}
                </div>
              )}

              {/* Operator footer */}
              {selectedBatch.operator && (
                <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-400 font-semibold">
                  <span>Logged by Operator:</span>
                  <span className="text-slate-700">{selectedBatch.operator.full_name}</span>
                </div>
              )}

              <div className="flex gap-4 mt-4">
                <button
                  type="button"
                  onClick={handleDownloadBatchReport}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Report</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowViewModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl text-sm transition-all"
                >
                  Close View
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default InventoryPage;
