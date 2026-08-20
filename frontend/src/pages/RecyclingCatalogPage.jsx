import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Layers, 
  FlaskConical, 
  Scissors, 
  Sprout, 
  Flame, 
  AlertTriangle, 
  ArrowUpRight, 
  X, 
  Download, 
  CheckCircle, 
  Zap, 
  Globe, 
  ShieldCheck, 
  Cpu, 
  BookOpen 
} from 'lucide-react';

const RECYCLING_METHODS = [
  // 🟢 SECTION A: MECHANICAL RECYCLING METHODS
  {
    id: 'mech-01',
    name: 'Mechanical Rotary Shredding & Fiber Garnetting',
    category: 'Mechanical Recycling',
    categoryColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: Layers,
    summary: 'Mechanical pull-apart process that tears woven/knitted fabric scraps into loose cotton or cellulosic fluff for yarn re-spinning.',
    fabrics: ['100% Cotton', 'Denim', 'Linen', 'Wool Scraps'],
    yieldPct: 94,
    co2OffsetKg: 6.65,
    energySavingsPct: 75,
    waterSavingsLiters: 9550,
    suitableCondition: 'Clean to Light Stain',
    maxContamination: '< 2% Synthetic Thread / Trims',
    equipment: ['Rotary Garnetting Drums', 'Pin Shredder Rollers', 'Pneumatic Dust Extractor', 'Hydraulic Baler'],
    reagents: ['Antistatic Spray Emulsion (Starch-Based)'],
    outputs: ['Carded Fiber Fluff', 'Open-End Spun Yarns', 'Coarse Denim Yarns'],
    offtakers: ['Ring Spinning Mills', 'Circular Denim Weavers', 'Craft Yarns'],
    workflow: [
      '1. De-trimming: Remove zippers, buttons, rivets, and heavy elastane seams.',
      '2. Coarse Guillotine Cutting: Chop fabrics into 5x5 cm uniform squares.',
      '3. Garnetting Pin Extraction: Pass through rotating pin drums to pull fibers into loose fluff.',
      '4. Carding & Baling: Compress opened fibers into 200kg bales ready for yarn spinning mills.'
    ],
    qualitySpec: 'Staple Length: 18 - 24 mm | Dust Content < 1.2%',
    safetyPpe: 'N95 Micro-Porous Dust Respirator, Anti-Static Safety Goggles, Hearing Protection (85 dB)'
  },
  {
    id: 'mech-02',
    name: 'Melt Extrusion & Pelletization (rPET Chips)',
    category: 'Mechanical Recycling',
    categoryColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: Layers,
    summary: 'Thermal melting of clean PET polyester synthetic scraps into high-purity recycled polyester pellets for synthetic yarn extrusion.',
    fabrics: ['100% Polyester', 'PET Filament Offcuts'],
    yieldPct: 88,
    co2OffsetKg: 2.76,
    energySavingsPct: 58,
    waterSavingsLiters: 51.5,
    suitableCondition: 'Clean (Free of Disperse Dye Residue)',
    maxContamination: '< 50 ppm PVC / Non-Melting Resins',
    equipment: ['Twin-Screw Extruders', 'Vacuum Melt Degassers', 'Underwater Pellet Cutters', 'Crystallizer Dryer'],
    reagents: ['Thermal Stabilizer Additives'],
    outputs: ['Recycled PET Pellets / Resin Chips', 'Staple Fiber Feedstock'],
    offtakers: ['Synthetic Fiber Spinners', 'Non-Woven Automotive Felts', 'Packaging Sheet Extruders'],
    workflow: [
      '1. Color & Polymer Sorting: Separate clear PET filaments from heavily dyed synthetics.',
      '2. Flake Shredding & Washing: Shred scraps into 8-12mm flakes and hot-wash with alkaline detergent.',
      '3. Twin-Screw Extrusion: Melt flakes at 260°C under high vacuum to strip volatile contaminants.',
      '4. Strand Pelletization: Cut molten strands underwater into uniform 3mm rPET chips.'
    ],
    qualitySpec: 'Intrinsic Viscosity (IV): 0.64 - 0.72 dL/g | Yellowness b* < 1.2',
    safetyPpe: 'High-Temp Thermal Gloves (300°C), VOC Vapor Protection Mask (A2P3), Explosion-Proof Scrubbers'
  },
  {
    id: 'mech-03',
    name: 'Wool Rag-Tearer & Needle-Punching Felting',
    category: 'Mechanical Recycling',
    categoryColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: Layers,
    summary: 'Traditional Prato-style mechanical tearing of protein wool fibers into dense felt matting for insulation and carpets.',
    fabrics: ['100% Wool', 'Merino Knits', 'Wool-Nylon Blends'],
    yieldPct: 85,
    co2OffsetKg: 13.10,
    energySavingsPct: 74,
    waterSavingsLiters: 1680,
    suitableCondition: 'Clean or Dry-Cleaned Scraps',
    maxContamination: '< 10 ppm Vegetable Matter',
    equipment: ['Rag-Tearing Cylinder Mills', 'Needle-Punching Felting Looms', 'Carding Machines'],
    reagents: ['Biodegradable Scouring Soap', 'Lanolin Emulsion'],
    outputs: ['Non-Woven Wool Felt', 'Carpet Underlayment', 'Prato Carded Yarns'],
    offtakers: ['Prato Textile Mills', 'Acoustic Wall Panel Manufacturers', 'Matting Suppliers'],
    workflow: [
      '1. Color Sorting: Group wool scraps by shade to avoid re-dyeing.',
      '2. Lubrication & Maceration: Spray wool with lanolin emulsion to preserve natural fiber elasticity.',
      '3. Rag-Tearing: Pull knits apart using heavy rag-tearing drums.',
      '4. Needle Punching: Interlock fibers mechanically into dense acoustic insulation sheets.'
    ],
    qualitySpec: 'Fiber Diameter: 21.5 Micron | Wool Content > 80%',
    safetyPpe: 'Dust Respirator (N95), Anti-Static Eyewear, Thermal Felting Gloves'
  },
  {
    id: 'mech-04',
    name: 'Air-Laid Non-Woven Web Formation',
    category: 'Mechanical Recycling',
    categoryColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: Layers,
    summary: 'Air-dispersion technique that suspends shredded mixed fibers into uniform non-woven webs for automotive soundproofing.',
    fabrics: ['Mixed Synthetics', 'Post-Consumer Scraps', 'Poly-Cotton'],
    yieldPct: 92,
    co2OffsetKg: 3.40,
    energySavingsPct: 62,
    waterSavingsLiters: 380,
    suitableCondition: 'Dry Offcuts',
    maxContamination: '< 5% Metal Trims',
    equipment: ['Air-Laid Web Formers', 'Thermal Bonding Ovens', 'Calender Rolls'],
    reagents: ['Bico Low-Melt Binding Fibers'],
    outputs: ['Automotive Acoustic Batts', 'Mattress Cushion Pads', 'Building Insulation'],
    offtakers: ['Automotive OEM Suppliers', 'Furniture Manufacturers'],
    workflow: [
      '1. Shredding: Reduce mixed textile scraps into short 10-15mm fiber clusters.',
      '2. Air Suspension: Blow fibers into a vacuum chamber to create an isotropic web.',
      '3. Thermal Activation: Pass web through 180°C oven to melt low-melt binder fibers.',
      '4. Compression Rollers: Press web to exact thickness and density tolerances.'
    ],
    qualitySpec: 'Density: 400 - 1200 g/m² | Acoustic Absorption Alpha > 0.85',
    safetyPpe: 'Dust Mask (P2), Heavy Industrial Gloves, Hearing Protection'
  },
  {
    id: 'mech-05',
    name: 'Dry Mechanical Decortication (Bast Fiber Extract)',
    category: 'Mechanical Recycling',
    categoryColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: Layers,
    summary: 'Impact decortication process for extracting strong bast fibers from linen, hemp, and jute industrial waste streams.',
    fabrics: ['Linen Scraps', 'Hemp Fabrics', 'Jute Sacking Waste'],
    yieldPct: 82,
    co2OffsetKg: 4.80,
    energySavingsPct: 80,
    waterSavingsLiters: 2100,
    suitableCondition: 'Dry Agricultural & Mill Waste',
    maxContamination: '< 1% Shive / Bark Residue',
    equipment: ['Fluted Decorticator Rolls', 'Scutcher Turbines', 'Fiber Hackling Frames'],
    reagents: ['Zero Reagents (Dry Physical Process)'],
    outputs: ['Long Bast Fibers', 'Short Fiber Tow', 'Bio-Composite Matting'],
    offtakers: ['Natural Fiber Spinners', 'Bio-Composite Molding Plants'],
    workflow: [
      '1. Conditioning: Adjust moisture content of bast scraps to 10-12%.',
      '2. Fluted Rolling: Break rigid woody shives through corrugated rollers.',
      '3. Scutching: Beat away woody core debris to isolate clean long fibers.',
      '4. Hackling: Comb fibers parallel for high-tenacity yarn spinning.'
    ],
    qualitySpec: 'Clean Bast Fiber Content > 95% | Moisture Content 10%',
    safetyPpe: 'Dust Mask (N95), Cut-Resistant Kevlar Gloves'
  },
  {
    id: 'mech-06',
    name: 'Ultrasonic Guillotine Cutting & Industrial Baling',
    category: 'Mechanical Recycling',
    categoryColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: Layers,
    summary: 'High-speed ultrasonic slitting and cutting of clean fabric scraps into commercial wiping rags and packaging shoddy.',
    fabrics: ['All Woven & Knitted Offcuts', 'Cotton T-Shirt Scraps'],
    yieldPct: 98,
    co2OffsetKg: 1.20,
    energySavingsPct: 90,
    waterSavingsLiters: 120,
    suitableCondition: 'Clean Scraps',
    maxContamination: 'Zero Buttons or Zippers',
    equipment: ['Ultrasonic Cutting Blades', 'Automated Sizing Tables', 'Hydraulic Baler'],
    reagents: ['Zero Reagents'],
    outputs: ['Commercial Wiping Rags', 'Absorbent Shop Towels', 'Baled Shoddy'],
    offtakers: ['Industrial Machinery Maintenance', 'Maritime Cleaners', 'Janitorial Suppliers'],
    workflow: [
      '1. Metal Detection: Scan fabric pieces under high-sensitivity magnetic sensors.',
      '2. Ultrasonic Slicing: Cut fabrics into uniform 40x40 cm rags without fraying edges.',
      '3. Absorbency Sorting: Separate high-absorbency cottons from low-absorbency synthetics.',
      '4. Compressed Baling: Package rags into 10kg transparent retail packs.'
    ],
    qualitySpec: 'Dimensions: 40x40 cm ± 2cm | Absorbency < 5 seconds',
    safetyPpe: 'Cut-Resistant Mesh Gloves, Safety Glasses'
  },

  // 🧪 SECTION B: CHEMICAL DEPOLYMERIZATION & DISSOLUTION
  {
    id: 'chem-07',
    name: 'PET Glycolysis Monomer Depolymerization',
    category: 'Chemical Depolymerization',
    categoryColor: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: FlaskConical,
    summary: 'Chemical depolymerization using monoethylene glycol to break PET polyester polymer chains into pure BHET monomers.',
    fabrics: ['100% PET Polyester', 'Poly-Cotton Apparel Scraps'],
    yieldPct: 86,
    co2OffsetKg: 2.50,
    energySavingsPct: 52,
    waterSavingsLiters: 85,
    suitableCondition: 'Dyed or Printed Synthetic Scraps',
    maxContamination: '< 2% Cotton / Cellulosic Threads',
    equipment: ['Glycolysis Reactor Vessel', 'Filter Presses', 'Crystallization Tanks', 'Distillation Column'],
    reagents: ['Monoethylene Glycol (MEG)', 'Zinc Acetate Catalyst'],
    outputs: ['Bis(2-hydroxyethyl) Terephthalate (BHET) Monomers', 'Pure Ethylene Glycol'],
    offtakers: ['Virgin-Quality Polymer Plants', 'Fiber Extrusion Mills'],
    workflow: [
      '1. Reactor Feeding: Mix shredded PET flakes with excess monoethylene glycol (MEG).',
      '2. Catalyzed Cleavage: Heat mixture to 190-210°C with zinc acetate catalyst for 3 hours.',
      '3. Filtration: Press out unreacted cellulosic fibers and insoluble dyes.',
      '4. Monomer Crystallization: Cool liquid to precipitate pure white BHET crystals.'
    ],
    qualitySpec: 'BHET Monomer Purity > 99.5% | Melting Point 110°C',
    safetyPpe: 'Vapor Mask (A2P3), Chemical Splash Suit, Neoprene Solvents Gloves'
  },
  {
    id: 'chem-08',
    name: 'Nylon 6 Hydrolytic Depolymerization',
    category: 'Chemical Depolymerization',
    categoryColor: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: FlaskConical,
    summary: 'Superheated steam cleavage of Polyamide 6 (Nylon 6) back into pure monomeric caprolactam for infinite nylon circularity.',
    fabrics: ['100% Nylon 6', 'Fishing Nets', 'Nylon Carpet Scraps'],
    yieldPct: 84,
    co2OffsetKg: 4.10,
    energySavingsPct: 68,
    waterSavingsLiters: 110,
    suitableCondition: 'Nylon Waste',
    maxContamination: '< 1% Polypropylene',
    equipment: ['High-Pressure Hydrolysis Reactor', 'Phosphoric Acid Doser', 'Distillation Column'],
    reagents: ['Superheated Water Steam', 'Phosphoric Acid Catalyst'],
    outputs: ['Pure Monomeric Caprolactam'],
    offtakers: ['Econyl-Type Nylon Re-Spinning Mills', 'Engineering Plastics'],
    workflow: [
      '1. Shredding & Washing: Shred nylon 6 scraps and strip surface lubricants.',
      '2. Steam Hydrolysis: React nylon with superheated steam at 300°C under 15 bar pressure.',
      '3. Distillation: Vaporize caprolactam monomer away from residual inorganic pigments.',
      '4. Polymerization: Re-polymerize caprolactam into virgin-equivalent Nylon 6 chips.'
    ],
    qualitySpec: 'Caprolactam Purity > 99.9% | Permanganate Number > 2000s',
    safetyPpe: 'High-Pressure SteamPPE, Thermal Chemical Mask, Acid Gloves'
  },
  {
    id: 'chem-09',
    name: 'Cellulose Ionic Liquid Dissolution (Lyocell-Type)',
    category: 'Chemical Dissolution',
    categoryColor: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: FlaskConical,
    summary: 'Closed-loop solvent dissolution that dissolves worn cotton cellulose into a pulp for spinning regenerated Lyocell/Circulose fibers.',
    fabrics: ['100% Cotton', 'Viscose', 'Rayon Wastes'],
    yieldPct: 91,
    co2OffsetKg: 6.20,
    energySavingsPct: 65,
    waterSavingsLiters: 8900,
    suitableCondition: 'Cellulosic Fabric Scraps',
    maxContamination: '< 0.5% Polyester',
    equipment: ['High-Shear Dissolution Tanks', 'Filter Presses', 'Dry-Jet Wet Spinneret Rig', 'Solvent Recovery Column'],
    reagents: ['N-Methylmorpholine N-oxide (NMMO)', 'Ionic Liquid (EmimOAc)'],
    outputs: ['Regenerated Cellulosic Pulp', 'Circulose / Refibra Staple Fibers'],
    offtakers: ['Premium Apparel Weavers', 'Non-Woven Medical Wipes'],
    workflow: [
      '1. Shredding & De-colorization: Shred cotton and bleach out heavy dye molecules.',
      '2. NMMO Dissolution: Mix cellulose pulp with 99.5% closed-loop NMMO solvent at 110°C.',
      '3. Extrusion Spinning: Press viscous dope through micro-spinneret nozzles into water bath.',
      '4. Solvent Recovery: Capture 99.7% of NMMO solvent for continuous circular reuse.'
    ],
    qualitySpec: 'Degree of Polymerization (DP): 450 - 600 | Tenacity > 32 cN/tex',
    safetyPpe: 'Organic Vapor Mask, Chemical Goggles, Nitrile Solvents Apron'
  },
  {
    id: 'chem-10',
    name: 'Solvent Hydrothermal Poly-Cotton Separation',
    category: 'Chemical Dissolution',
    categoryColor: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: FlaskConical,
    summary: 'Selective hydrothermal technique that dissolves cellulose out of poly-cotton blends, leaving intact PET synthetic fibers.',
    fabrics: ['50/50 Poly-Cotton Blends', 'Bed Sheet Scrap Streams'],
    yieldPct: 83,
    co2OffsetKg: 5.10,
    energySavingsPct: 55,
    waterSavingsLiters: 4200,
    suitableCondition: 'Mixed Blend Garments',
    maxContamination: '< 2% Elastane',
    equipment: ['Hydrothermal Autoclaves', 'Centrifugal Decanters', 'Solvent Evaporators'],
    reagents: ['Green Solvent (Dimethyl Sulfoxide / NMP)', 'Dilute Acid Catalyst'],
    outputs: ['Pure PET Filament Flakes', 'Cellulosic Glucose Syrup / Pulp'],
    offtakers: ['Polyester Re-Melt Extruders', 'Bio-Ethanol Fermentation Facilities'],
    workflow: [
      '1. Autoclave Charging: Load blended fabric into hydrothermal pressure vessel.',
      '2. Selective Dissolution: Heat to 140°C with organic solvent to dissolve cotton component.',
      '3. Solid/Liquid Separation: Filter out intact PET polyester fibers.',
      '4. Solvent Evaporation: Distill off solvent to recover pure cellulosic Glucose / Pulp.'
    ],
    qualitySpec: 'PET Purity > 98.5% | Cellulosic Pulp Recovery > 90%',
    safetyPpe: 'Autoclave Thermal Gloves, Solvent Vapor Respirator, Visor'
  },
  {
    id: 'chem-11',
    name: 'Methanolysis Depolymerization of PET',
    category: 'Chemical Depolymerization',
    categoryColor: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: FlaskConical,
    summary: 'High-pressure methanol treatment that breaks down dark, heavily dyed polyester fabrics into DMT and Ethylene Glycol.',
    fabrics: ['Heavily Dyed PET', 'Printed Microfiber Synthetic Waste'],
    yieldPct: 82,
    co2OffsetKg: 2.30,
    energySavingsPct: 48,
    waterSavingsLiters: 70,
    suitableCondition: 'Dark / Printed Synthetics',
    maxContamination: '< 1% Polyurethane Coating',
    equipment: ['High-Pressure Methanol Reactors', 'Fractionation Columns', 'DMT Crystallizer'],
    reagents: ['High-Purity Methanol', 'Magnesium Acetate Catalyst'],
    outputs: ['Dimethyl Terephthalate (DMT)', 'Ethylene Glycol (EG)'],
    offtakers: ['Virgin Polyester Synthesis Plants', 'Film Extruders'],
    workflow: [
      '1. Methanol Charging: Mix shredded PET with liquid methanol in 1:4 molar ratio.',
      '2. High-Pressure Reaction: Heat to 260°C at 70 bar pressure for 2 hours.',
      '3. Distillation: Separate volatile Ethylene Glycol from crude DMT.',
      '4. DMT Recrystallization: Purify DMT crystals via methanol washing.'
    ],
    qualitySpec: 'DMT Purity > 99.8% | Acid Value < 0.1 mg KOH/g',
    safetyPpe: 'High-Pressure Gas Respirator, Fire-Retardant Chemical Suit'
  },
  {
    id: 'chem-12',
    name: 'Selective Chemical Elastane Removal',
    category: 'Chemical Dissolution',
    categoryColor: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: FlaskConical,
    summary: 'Specialized chemical wash that selectively degrades elastane (Spandex/Lycra) polyurethane bonds from stretch denim.',
    fabrics: ['Stretch Denim', 'Cotton-Spandex Fabrics (<5% Elastane)'],
    yieldPct: 87,
    co2OffsetKg: 4.50,
    energySavingsPct: 60,
    waterSavingsLiters: 1200,
    suitableCondition: 'Post-Consumer Stretch Apparel',
    maxContamination: 'Zero Heavy Rivets',
    equipment: ['Chemical Washing Drums', 'Centrifugal Dewatering Skids', 'Drying Tunnel'],
    reagents: ['Dilute Sodium Hydroxide', 'Benign Polyurethane Degrading Agent'],
    outputs: ['100% Pure Cotton Staple Scraps', 'Degraded Polyurethane Residue'],
    offtakers: ['Mechanical Cotton Garnetters', 'Cellulosic Recyclers'],
    workflow: [
      '1. Pre-shredding: Cut stretch denim into 3x3cm pieces.',
      '2. Chemical Wash: Tumble scraps in 85°C alkaline solution to dissolve elastane crosslinks.',
      '3. Centrifugal Rinsing: Spin out degraded polyurethane liquor.',
      '4. Drying: Dry clean, non-stretch cotton pieces for traditional mechanical yarn spinning.'
    ],
    qualitySpec: 'Residual Elastane < 0.05% | Cotton Fiber Strength Uncompromised',
    safetyPpe: 'Alkaline Resistant Apron, Face Shield, Rubber Boots'
  },

  // 🎨 SECTION C: UPCYCLING & CREATIVE REMANUFACTURING
  {
    id: 'upcycle-13',
    name: 'Zero-Waste Garment Patchwork Remanufacturing',
    category: 'Upcycling & Remanufacturing',
    categoryColor: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: Scissors,
    summary: 'High-value creative redesign method that cuts intact panel sections from rejected apparel for stitching designer upcycled lines.',
    fabrics: ['High-Grade Denim', 'Jacquard Scraps', 'Silk Offcuts'],
    yieldPct: 96,
    co2OffsetKg: 7.50,
    energySavingsPct: 88,
    waterSavingsLiters: 11200,
    suitableCondition: 'Unused Factory Seconds / Overstock',
    maxContamination: 'N/A',
    equipment: ['Computerized Pattern Scanners', 'CNC Laser Cutters', 'Heavy-Duty Industrial Sewing Stations'],
    reagents: ['Zero Chemical Reagents'],
    outputs: ['Upcycled Designer Jackets', 'Denim Patchwork Bags', 'Luxury Accessories'],
    offtakers: ['Circular Fashion Brands', 'Boutique Apparel Retailers'],
    workflow: [
      '1. AI Pattern Scanning: Scan damaged garments to identify unblemished fabric panels.',
      '2. Laser Panel Cutting: Precision-cut pattern pieces avoiding tears or stains.',
      '3. Artisanal Assembly: Stitch panels together using zero-waste geometric design layouts.',
      '4. Quality Inspection: Attach Digital Product Passport (DPP) QR tags for origin tracking.'
    ],
    qualitySpec: 'Seam Strength > 250 N | Design Uniqueness 100%',
    safetyPpe: 'Laser Safety Glasses, Ergonomic Sewing Gloves'
  },
  {
    id: 'upcycle-14',
    name: 'Furniture Upholstery & Cushion Stuffing',
    category: 'Upcycling & Remanufacturing',
    categoryColor: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: Scissors,
    summary: 'Direct mechanical chopping of heavy canvas and upholstery scraps into resilient filling material for furniture cushions and pet beds.',
    fabrics: ['Heavy Canvas', 'Corduroy', 'Synthetic Upholstery Scraps'],
    yieldPct: 94,
    co2OffsetKg: 4.20,
    energySavingsPct: 82,
    waterSavingsLiters: 450,
    suitableCondition: 'Clean Factory Cut-Offs',
    maxContamination: '< 1% Dust',
    equipment: ['Heavy Duty Rotary Shredder', 'Pneumatic Cushion Blower', 'Baling Press'],
    reagents: ['Flame Retardant Spray (Borate-Based)'],
    outputs: ['Furniture Cushion Filling', 'Pet Bed Stuffing', 'Boxing Bag Fillers'],
    offtakers: ['Upholstery Manufacturers', 'Pet Supplies Retailers'],
    workflow: [
      '1. Sorting: Group heavy woven fabrics away from thin knit scraps.',
      '2. Rotary Chopping: Chop fabrics into 2x2cm dense fiber clusters.',
      '3. Flame-Retardant Mist: Apply non-toxic flame retardant spray coating.',
      '4. Pneumatic Stuffing: Blow filler directly into cushion liner casings.'
    ],
    qualitySpec: 'Resilience Bounce-Back > 85% | Flame Spec CAL 117 Compliant',
    safetyPpe: 'Dust Respirator (P2), Heavy Leather Work Gloves'
  },
  {
    id: 'upcycle-15',
    name: 'Artisanal Hand-Weaving & Rag-Rug Crafting',
    category: 'Upcycling & Remanufacturing',
    categoryColor: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: Scissors,
    summary: 'Community-based upcycling that slices soft jersey T-shirt salvage into continuous yarn strips for hand-weaving durable floor rugs.',
    fabrics: ['T-Shirt Jersey Scraps', 'Printed Cotton Salvage Strips'],
    yieldPct: 98,
    co2OffsetKg: 6.80,
    energySavingsPct: 95,
    waterSavingsLiters: 8900,
    suitableCondition: 'Clean Soft Knits',
    maxContamination: 'Zero Synthetic Zippers',
    equipment: ['Rotary Strip Cutters', 'Manual Wooden Frame Looms', 'Winding Wheels'],
    reagents: ['Zero Reagents'],
    outputs: ['Hand-Woven Rag Rugs', 'Decorative Tapestries', 'Craft Yarn Balls'],
    offtakers: ['Fair-Trade Craft Marketplaces', 'Home Decor Retailers'],
    workflow: [
      '1. Strip Slicing: Slice continuous 2cm wide strips from T-shirt bodies.',
      '2. Yarn Spooling: Stretch and wind jersey strips into round yarn balls.',
      '3. Loom Warping: Set up warp cotton threads on manual frame looms.',
      '4. Hand Weaving: Weave rag strips in alternating colors to create thick, washable floor mats.'
    ],
    qualitySpec: 'Rug Thickness: 12 - 18 mm | Machine Washable at 40°C',
    safetyPpe: 'Ergonomic Wrist Wraps, Safety Rotary Shear Guards'
  },
  {
    id: 'upcycle-16',
    name: 'Textile Bio-Composite Structural Board Molding',
    category: 'Upcycling & Remanufacturing',
    categoryColor: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: Scissors,
    summary: 'Thermal compression technique that fuses mixed fiber scraps with bio-resins to produce structural composite wall boards.',
    fabrics: ['Mixed Fiber Offcuts', 'Un-Sortable Garment Trimmings'],
    yieldPct: 90,
    co2OffsetKg: 3.10,
    energySavingsPct: 50,
    waterSavingsLiters: 180,
    suitableCondition: 'Dry Shredded Scraps',
    maxContamination: '< 3% Metal Eyelets',
    equipment: ['Hydraulic Thermal Compression Press', 'Resin Atomizer Spray Rig', 'CNC Edge Router'],
    reagents: ['Bio-Based Polyurethane Resin / Epoxidized Soybean Oil'],
    outputs: ['Acoustic Wall Panels', 'Architectural Composite Boards', 'Furniture Core Material'],
    offtakers: ['Interior Architecture Firms', 'Green Building Contractors'],
    workflow: [
      '1. Fiber Coarse Shredding: Reduce mixed scraps into 10mm random fibers.',
      '2. Resin Blending: Spray 12% bio-based resin binder onto tumbling fiber mass.',
      '3. Mat Layup: Spread resin-coated fibers evenly into a 50mm thick mat mold.',
      '4. High-Pressure Hot Pressing: Press at 170°C under 40 bar pressure for 8 minutes to cure dense 12mm boards.'
    ],
    qualitySpec: 'Flexural Strength > 18 MPa | Density 850 kg/m³ | Fire Rating B1',
    safetyPpe: 'Resin Vapor Mask (A2P3), High-Temp Gloves, Safety Glasses'
  },

  // 🌱 SECTION D: BIOLOGICAL & COMPOSTING PATHWAYS
  {
    id: 'bio-17',
    name: 'Industrial Aerobic Thermophilic Composting',
    category: 'Biological & Composting',
    categoryColor: 'bg-lime-50 text-lime-700 border-lime-200',
    icon: Sprout,
    summary: 'Controlled microbial biodegradation of 100% natural, unbleached cotton and linen fabrics into nutrient-rich agricultural humus.',
    fabrics: ['100% Organic Unbleached Cotton', 'Linen', 'Pure Hemp (Zero Synthetics)'],
    yieldPct: 74,
    co2OffsetKg: 5.50,
    energySavingsPct: 90,
    waterSavingsLiters: 4800,
    suitableCondition: 'Natural Fibers Free of Synthetic Dyes or Finishes',
    maxContamination: 'Zero Synthetic Polyester Thread / Labels',
    equipment: ['Aerated In-Vessel Compost Tumblers', 'Shredder Mills', 'Screening Trommels'],
    reagents: ['Water', 'Nitrogen-Rich Organic Activator (Manure / Food Waste)'],
    outputs: ['Nutrient-Rich Bio-Humus Compost', 'Soil Conditioner'],
    offtakers: ['Organic Agricultural Farms', 'Horticultural Nurseries'],
    workflow: [
      '1. Strict Fiber Verification: Perform NIR spectrographic scan to confirm zero synthetic content.',
      '2. Micro-Shredding: Shred natural fabrics into 1x1cm pieces to accelerate surface area degradation.',
      '3. Carbon/Nitrogen Ratio Adjustment: Mix 3 parts shredded cotton (Carbon) with 1 part organic waste (Nitrogen).',
      '4. Thermophilic Degradation: Maintain compost vessel at 55-65°C with forced aeration for 45 days.'
    ],
    qualitySpec: 'Compost Maturity Index > 7 | Heavy Metal Content < EN 13432 Limits',
    safetyPpe: 'Bio-Dust Respirator (P3), Moisture-Proof Rubber Gloves'
  },
  {
    id: 'bio-18',
    name: 'Enzymatic Bio-Recycling (PETase Cleavage)',
    category: 'Biological & Composting',
    categoryColor: 'bg-lime-50 text-lime-700 border-lime-200',
    icon: Sprout,
    summary: 'Cutting-edge biological depolymerization using engineered PETase enzymes to break down polyester fabrics into pure monomers at ambient heat.',
    fabrics: ['Micro-Polyester Flakes', 'Synthetic Apparel Scraps'],
    yieldPct: 83,
    co2OffsetKg: 3.20,
    energySavingsPct: 70,
    waterSavingsLiters: 140,
    suitableCondition: 'Shredded PET Scraps',
    maxContamination: '< 2% Cotton',
    equipment: ['Stirred Bioreactor Tanks', 'Ultrafiltration Skids', 'Crystallization Column'],
    reagents: ['Engineered LCC PETase Enzymes', 'pH Buffer Solution'],
    outputs: ['Purified Terephthalic Acid (TPA)', 'Monoethylene Glycol (EG)'],
    offtakers: ['Circular Polyester Chemical Manufacturers'],
    workflow: [
      '1. Micronization: Grind polyester scraps into ultra-fine 200-micron powder.',
      '2. Bioreactor Loading: Suspend powder in water buffer inside 65°C bioreactor vessel.',
      '3. Enzyme Dosing: Add engineered PETase enzyme; allow 16-24 hours for complete enzymatic cleavage.',
      '4. Monomer Separation: Filter out enzyme solution and crystallize pure TPA monomers.'
    ],
    qualitySpec: 'TPA Monomer Purity > 99.7% | Bio-Conversion Rate > 90%',
    safetyPpe: 'Lab Coat, Biological Safety Glasses, Nitrile Exam Gloves'
  },
  {
    id: 'bio-19',
    name: 'Anaerobic Biogas Digestion of Cellulosic Waste',
    category: 'Biological & Composting',
    categoryColor: 'bg-lime-50 text-lime-700 border-lime-200',
    icon: Sprout,
    summary: 'Methane-producing anaerobic bacterial digestion of degraded natural fibers and wet cotton processing sludge to generate bio-energy.',
    fabrics: ['Degraded Cotton Sludge', 'Wet Cellulosic Scraps'],
    yieldPct: 68,
    co2OffsetKg: 4.10,
    energySavingsPct: 85,
    waterSavingsLiters: 320,
    suitableCondition: 'Wet / Degraded Natural Fibers',
    maxContamination: '< 1% Heavy Dyes',
    equipment: ['Anaerobic Digester Vessel', 'Biogas Desulfurization Tower', 'CHP Biogas Engine Generator'],
    reagents: ['Methanogenic Bacterial Inoculum'],
    outputs: ['Methane Biogas (60% CH4)', 'Liquid Bio-Fertilizer Digestate'],
    offtakers: ['Municipal Electricity Grids', 'Local Farm Fertilizers'],
    workflow: [
      '1. Thermal Pre-treatment: Heat cellulosic sludge to 120°C to break down crystalline cellulose structures.',
      '2. Digester Feeding: Pump slurry into sealed anaerobic digester tank.',
      '3. Bacterial Fermentation: Maintain 37°C mesophilic environment for 21 days as bacteria generate methane gas.',
      '4. Power Generation: Scrub biogas and burn in CHP engine to generate green electricity.'
    ],
    qualitySpec: 'Biogas Methane Yield > 350 L/kg volatile solids | CH4 Purity 62%',
    safetyPpe: 'Gas Detector Badge (H2S/CH4), ATEX Explosion-Proof Boots'
  },

  // 🔥 SECTION E: THERMAL & ENERGY RECOVERY PATHWAYS
  {
    id: 'therm-20',
    name: 'Waste-to-Energy (WtE) Controlled Incineration',
    category: 'Thermal & Energy Recovery',
    categoryColor: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Flame,
    summary: 'High-temperature incineration of non-recyclable, heavily contaminated synthetic scraps to generate municipal steam and electricity.',
    fabrics: ['Heavily Oil/Grease Contaminated Synthetics', 'Un-Sortable Mixed Waste'],
    yieldPct: 85,
    co2OffsetKg: 1.80,
    energySavingsPct: 40,
    waterSavingsLiters: 0,
    suitableCondition: 'Non-Recyclable Contaminated Waste',
    maxContamination: '< 100 ppm Heavy Metals',
    equipment: ['Fluidized Bed Incinerator Furnace', 'Boiler Steam Turbine', 'Electrostatic Precipitator', 'Lime Gas Scrubber'],
    reagents: ['Hydrated Lime', 'Activated Carbon Powder'],
    outputs: ['High-Pressure Industrial Steam', 'Municipal Grid Electricity', 'Inert Bottom Ash'],
    offtakers: ['Regional Power Utilities', 'District Heating Networks'],
    workflow: [
      '1. Waste Shredding: Shred contaminated rags into uniform 10cm fuel chunks.',
      '2. High-Heat Combustion: Burn fuel in fluidized bed furnace at 850 - 1000°C.',
      '3. Steam Power Generation: Capture heat in water boilers to drive 25 MW steam turbine.',
      '4. Flue Gas Scrubbing: Neutralize acid gases with lime slurry and filter 99.8% of particulates.'
    ],
    qualitySpec: 'Calorific Fuel Value: 18 - 22 MJ/kg | Stack Dioxin Emission < 0.1 ng TEQ/m³',
    safetyPpe: 'Heat Shield Suit, Self-Contained Breathing Apparatus (SCBA)'
  },
  {
    id: 'therm-21',
    name: 'Pyrolysis & Thermal Gasification to Bio-Crude',
    category: 'Thermal & Energy Recovery',
    categoryColor: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Flame,
    summary: 'Oxygen-deprived thermal cracking of synthetic polymer textiles into liquid bio-crude oil and synthetic gas.',
    fabrics: ['Mixed Polymeric Scraps', 'Rubber-Coated Synthetics', 'Spandex Blends'],
    yieldPct: 78,
    co2OffsetKg: 2.20,
    energySavingsPct: 60,
    waterSavingsLiters: 40,
    suitableCondition: 'Dry Polymeric Waste Stream',
    maxContamination: '< 1% Moisture Content',
    equipment: ['Rotary Pyrolysis Kiln Reactor', 'Condenser Fractional Columns', 'Syngas Burner'],
    reagents: ['Nitrogen Purge Gas (Zero Oxygen)'],
    outputs: ['Pyrolysis Bio-Crude Oil', 'Synthetic Fuel Gas (Syngas)', 'Recovered Carbon Black Residue'],
    offtakers: ['Petrochemical Refineries', 'Industrial Kiln Fuel Suppliers'],
    workflow: [
      '1. Nitrogen Purging: Load dry synthetic scraps and purge reactor with nitrogen to displace oxygen.',
      '2. Thermal Cracking: Heat to 500°C in absence of air to break long polymer chains into gas vapors.',
      '3. Vapor Condensation: Cool gases through fractional condensers to collect heavy bio-crude oil.',
      '4. Syngas Recirculation: Burn non-condensable syngas to provide self-sustaining heat to pyrolysis kiln.'
    ],
    qualitySpec: 'Bio-Oil Calorific Value: 40 MJ/kg | Viscosity < 10 cSt at 40°C',
    safetyPpe: 'ATEX Flame-Proof Suit, Organic Gas SCBA, High-Temp Gloves'
  },
  {
    id: 'therm-22',
    name: 'Refuse-Derived Fuel (RDF) Cement Kiln Co-Processing',
    category: 'Thermal & Energy Recovery',
    categoryColor: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Flame,
    summary: 'Processing mixed synthetic scrap offcuts into high-calorific dense RDF fuel pellets to displace coal in cement manufacturing kilns.',
    fabrics: ['Carpet Scrap Backings', 'Mixed Industrial Trimmings'],
    yieldPct: 94,
    co2OffsetKg: 2.00,
    energySavingsPct: 50,
    waterSavingsLiters: 0,
    suitableCondition: 'Dry Industrial Waste',
    maxContamination: '< 0.5% Chlorine / PVC Content',
    equipment: ['Heavy Densifier Pelletizer', 'Rotary Drum Dryer', 'Magnetic Tramp Separator'],
    reagents: ['Zero Reagents'],
    outputs: ['High-Calorific RDF Energy Pellets (24 MJ/kg)'],
    offtakers: ['Cement Manufacturing Plants', 'Coal Power Plant Co-Firing'],
    workflow: [
      '1. Coarse Shredding & Magnet Removal: Shred waste to 30mm size and remove wire staples.',
      '2. Moisture Reduction: Pass through rotary dryer drum to achieve < 12% moisture.',
      '3. High-Pressure Pelletization: Compress waste into dense 10mm fuel pellets.',
      '4. Cement Kiln Co-Processing: Feed RDF into 1450°C cement kiln where ash is incorporated into clinker.'
    ],
    qualitySpec: 'Net Calorific Value > 22 MJ/kg | Chlorine Content < 0.3%',
    safetyPpe: 'Industrial Dust Respirator (P3), Hearing Protection, Safety Boots'
  },

  // 🚨 SECTION F: DISPOSAL & HAZARDOUS CONTAINMENT PATHWAYS
  {
    id: 'disp-23',
    name: 'Sanitary Geomembrane Landfill Cell Containment',
    category: 'Disposal & Containment',
    categoryColor: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: AlertTriangle,
    summary: 'Final secure landfill containment for non-recyclable, non-combustible textile waste in double-lined geomembrane cells.',
    fabrics: ['Toxic Chemical Stained Scraps', 'Un-Recyclable Composite Waste'],
    yieldPct: 0,
    co2OffsetKg: 0.00,
    energySavingsPct: 0,
    waterSavingsLiters: 0,
    suitableCondition: 'Final Disposal Waste (No Other Alternative Available)',
    maxContamination: 'N/A',
    equipment: ['HDPE Geomembrane Double Liner System', 'Leachate Collection Pumps', 'Methane Extraction Wells'],
    reagents: ['Bentonite Clay Layer'],
    outputs: ['Encapsulated Secure Waste Cell'],
    offtakers: ['Licensed Municipal Landfill Operations'],
    workflow: [
      '1. Waste Compaction: Compact non-recyclable scrap bales to maximum density.',
      '2. Cell Loading: Place compacted bales inside HDPE double-geomembrane lined cell.',
      '3. Daily Cover: Seal top with 15cm compacted clay soil to prevent wind vector leakage.',
      '4. Leachate Pumping: Continuously pump out and treat liquid leachate run-off.'
    ],
    qualitySpec: 'Permeability Coefficient k < 1x10⁻⁹ cm/s | 30-Year Monitoring Plan',
    safetyPpe: 'Hazmat Suit Level C, Chemical Resistant Boots, SCBA'
  },
  {
    id: 'disp-24',
    name: 'High-Temperature Hazardous Chemical Thermal Neutralization',
    category: 'Disposal & Containment',
    categoryColor: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: AlertTriangle,
    summary: 'Specialized thermal destruction above 1100°C for toxic solvent-contaminated chemical protective suits and hazardous industrial rags.',
    fabrics: ['Chemical Suit Scraps', 'Solvent Toxic Stained Rags'],
    yieldPct: 15,
    co2OffsetKg: 0.80,
    energySavingsPct: 20,
    waterSavingsLiters: 0,
    suitableCondition: 'Hazardous Chemical Contaminated Waste',
    maxContamination: 'Must Be Handled as Hazmat Code Class 6/8',
    equipment: ['Rotary Kiln Hazmat Incinerator (>1100°C)', 'Secondary Combustion Chamber', 'Wet Acid Scrubbers'],
    reagents: ['Lime Slurry Injection', 'Activated Carbon'],
    outputs: ['Inert Vitrified Slag Ash (Concrete Aggregate)'],
    offtakers: ['Hazmat Treatment Facilities', 'Concrete Aggregate Manufacturers'],
    workflow: [
      '1. Sealed Drum Shredding: Feed hazmat garments directly into nitrogen-purged shredder.',
      '2. Rotary Kiln Incineration: Burn at 1100°C for 2 seconds to destroy complex organic toxins.',
      '3. Acid Neutralization: Scrub exhaust gases with lime slurry to neutralize acid vapors.',
      '4. Slag Vitrification: Collect melted inert glass-like ash slag for safe concrete additive use.'
    ],
    qualitySpec: 'Destruction & Removal Efficiency (DRE) > 99.9999% | Zero Organic Toxins',
    safetyPpe: 'Full Hazmat Level A Suit, Closed-Circuit SCBA'
  }
];

const CATEGORIES = [
  'All',
  'Mechanical Recycling',
  'Chemical Depolymerization',
  'Chemical Dissolution',
  'Upcycling & Remanufacturing',
  'Biological & Composting',
  'Thermal & Energy Recovery',
  'Disposal & Containment'
];

const FABRICS_FILTER = [
  'All Fabrics',
  'Cotton',
  'Polyester',
  'Wool',
  'Denim',
  'Linen',
  'Nylon',
  'Blends'
];

const RecyclingCatalogPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedFabric, setSelectedFabric] = useState('All Fabrics');
  const [activeModalMethod, setActiveModalMethod] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Filtered Methods Computation
  const filteredMethods = useMemo(() => {
    return RECYCLING_METHODS.filter((m) => {
      const matchSearch = 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.equipment.some(e => e.toLowerCase().includes(searchTerm.toLowerCase())) ||
        m.outputs.some(o => o.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCategory = selectedCategory === 'All' || m.category === selectedCategory;

      const matchFabric = selectedFabric === 'All Fabrics' || 
        m.fabrics.some(f => f.toLowerCase().includes(selectedFabric.toLowerCase()));

      return matchSearch && matchCategory && matchFabric;
    });
  }, [searchTerm, selectedCategory, selectedFabric]);

  // Aggregate Metrics Summary
  const statsSummary = useMemo(() => {
    const totalCount = RECYCLING_METHODS.length;
    const avgYield = Math.round(RECYCLING_METHODS.reduce((acc, m) => acc + m.yieldPct, 0) / totalCount);
    const avgCo2 = (RECYCLING_METHODS.reduce((acc, m) => acc + m.co2OffsetKg, 0) / totalCount).toFixed(1);
    const maxYield = Math.max(...RECYCLING_METHODS.map(m => m.yieldPct));
    return { totalCount, avgYield, avgCo2, maxYield };
  }, []);

  const handleDownloadSpec = (method) => {
    const specText = `==================================================
TEXTILE WASTE INTELLIGENCE PLATFORM (TWIP)
TECHNICAL RECYCLING & DISPOSAL SPECIFICATION SHEET
==================================================
Method Name      : ${method.name}
Protocol Category: ${method.category}
Method Code ID   : ${method.id.toUpperCase()}
Generated Date   : ${new Date().toLocaleString()}

1. APPLICABLE FABRIC TYPES & CONDITION:
--------------------------------------------------
Supported Fabrics    : ${method.fabrics.join(', ')}
Suitable Condition   : ${method.suitableCondition}
Max Contamination    : ${method.maxContamination}

2. RESOURCE IMPACT & RECOVERY TELEMETRY:
--------------------------------------------------
Net Recovery Yield % : ${method.yieldPct}%
Carbon Offset (CO2e) : +${method.co2OffsetKg} kg CO2 saved per kg
Energy Savings vs V. : ${method.energySavingsPct}% Energy Offset
Water Conserved (L)  : +${method.waterSavingsLiters.toLocaleString()} Litres / kg

3. INDUSTRIAL EQUIPMENT & REAGENTS REQUIRED:
--------------------------------------------------
Required Machinery   : ${method.equipment.join(', ')}
Chemical Reagents    : ${method.reagents.join(', ')}
Output Stream        : ${method.outputs.join(', ')}
Primary Offtakers    : ${method.offtakers.join(', ')}

4. 4-STEP PROCESSING WORKFLOW:
--------------------------------------------------
${method.workflow.join('\n')}

5. QUALITY SPECIFICATIONS & SAFETY PROTOCOLS:
--------------------------------------------------
Quality Tolerances   : ${method.qualitySpec}
Chemical Safety PPE  : ${method.safetyPpe}
==================================================
Certified by TWIP LCA Intelligence & Process Engineering Standards (v2.4)
==================================================`;

    const blob = new Blob([specText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TWIP_Spec_${method.id.toUpperCase()}_${method.category.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-primary-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-primary-500/10 backdrop-blur-3xl transform skew-x-12"></div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 bg-primary-500/20 text-primary-300 border border-primary-500/30 px-3 py-1 rounded-full text-xs font-bold">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Module 6 & 7 Strategy Knowledge Engine</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            Recycling & Disposal Method Catalog
          </h1>
          <p className="text-sm text-slate-300 font-medium leading-relaxed">
            Comprehensive industrial directory of <strong>24 standardized textile circularity protocols</strong>. Explore operational workflows, required machinery, chemical solvents, recovery yields, and LCA impact metrics.
          </p>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80 relative z-10">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Catalog Protocols</span>
            <span className="text-2xl font-black text-white mt-0.5 block">{statsSummary.totalCount} Methods</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg Net Recovery Yield</span>
            <span className="text-2xl font-black text-emerald-400 mt-0.5 block">{statsSummary.avgYield}%</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg CO₂ Footprint Offset</span>
            <span className="text-2xl font-black text-blue-400 mt-0.5 block">+{statsSummary.avgCo2} kg/kg</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Max Pathway Yield</span>
            <span className="text-2xl font-black text-amber-400 mt-0.5 block">{statsSummary.maxYield}% Yield</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by method, fabric, equipment, or chemical..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-100 bg-slate-50/50"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Fabric Selector Dropdown */}
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <Filter className="h-4 w-4 text-slate-400 flex-shrink-0" />
            <span className="text-xs font-bold text-slate-500 flex-shrink-0">Fabric:</span>
            <select
              value={selectedFabric}
              onChange={(e) => setSelectedFabric(e.target.value)}
              className="py-2.5 px-3 rounded-2xl border border-slate-200 text-xs font-semibold bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-100 w-full md:w-48"
            >
              {FABRICS_FILTER.map((f, i) => (
                <option key={i} value={f}>{f}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          {CATEGORIES.map((cat, i) => (
            <button
              key={i}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-primary-600 text-white shadow-sm shadow-primary-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex justify-between items-center px-2">
        <span className="text-xs font-bold text-slate-500">
          Showing <strong className="text-slate-800">{filteredMethods.length}</strong> of {RECYCLING_METHODS.length} Technical Methods
        </span>
        {(searchTerm || selectedCategory !== 'All' || selectedFabric !== 'All Fabrics') && (
          <button
            onClick={() => { setSearchTerm(''); setSelectedCategory('All'); setSelectedFabric('All Fabrics'); }}
            className="text-xs font-bold text-primary-600 hover:text-primary-700 underline"
          >
            Reset All Filters
          </button>
        )}
      </div>

      {/* Methods Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMethods.map((method) => {
          const IconComponent = method.icon;
          return (
            <div 
              key={method.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group hover:border-primary-200"
            >
              <div className="space-y-3">
                {/* Category & ID Badge */}
                <div className="flex justify-between items-start">
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${method.categoryColor}`}>
                    {method.category}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                    {method.id}
                  </span>
                </div>

                {/* Method Title */}
                <div className="flex items-start space-x-3 pt-1">
                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-700 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors flex-shrink-0">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-800 leading-snug group-hover:text-primary-700 transition-colors">
                    {method.name}
                  </h3>
                </div>

                {/* Brief Summary */}
                <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-3">
                  {method.summary}
                </p>

                {/* Applicable Fabrics Pills */}
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Compatible Fabrics</span>
                  <div className="flex flex-wrap gap-1">
                    {method.fabrics.map((fab, idx) => (
                      <span key={idx} className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                        {fab}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Key Metrics Strip */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Yield</span>
                    <span className="text-xs font-black text-emerald-700">{method.yieldPct}%</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">CO₂ Offset</span>
                    <span className="text-xs font-black text-blue-700">+{method.co2OffsetKg}k</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Energy</span>
                    <span className="text-xs font-black text-indigo-700">-{method.energySavingsPct}%</span>
                  </div>
                </div>

                {/* Action CTA */}
                <button
                  onClick={() => setActiveModalMethod(method)}
                  className="w-full flex items-center justify-center space-x-1.5 bg-slate-900 hover:bg-primary-600 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-sm group-hover:shadow-md cursor-pointer"
                >
                  <span>View Full Protocol & Specs</span>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredMethods.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4 max-w-md mx-auto">
          <div className="h-16 w-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Search className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">No Matching Recycling Protocols</h3>
            <p className="text-xs text-slate-400 font-medium">
              No methods found matching "{searchTerm}". Try clearing search keywords or selecting a different category filter.
            </p>
          </div>
          <button
            onClick={() => { setSearchTerm(''); setSelectedCategory('All'); setSelectedFabric('All Fabrics'); }}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* DETAILED METHOD MODAL */}
      {activeModalMethod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl p-8 space-y-6 max-h-[90vh] overflow-y-auto my-8 relative">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-5">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${activeModalMethod.categoryColor}`}>
                    {activeModalMethod.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                    ID: {activeModalMethod.id.toUpperCase()}
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-900 sm:text-2xl leading-tight">
                  {activeModalMethod.name}
                </h2>
              </div>
              <button
                onClick={() => setActiveModalMethod(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Summary Box */}
            <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
              {activeModalMethod.summary}
            </p>

            {/* Resource Telemetry Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/60 rounded-2xl text-center">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Net Recovery Yield</span>
                <span className="text-lg font-black text-emerald-900">{activeModalMethod.yieldPct}% Yield</span>
              </div>
              <div className="p-3.5 bg-blue-50/60 border border-blue-200/60 rounded-2xl text-center">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Carbon Offset (CO₂e)</span>
                <span className="text-lg font-black text-blue-900">+{activeModalMethod.co2OffsetKg} kg/kg</span>
              </div>
              <div className="p-3.5 bg-indigo-50/60 border border-indigo-200/60 rounded-2xl text-center">
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">Energy Offset</span>
                <span className="text-lg font-black text-indigo-900">-{activeModalMethod.energySavingsPct}% Energy</span>
              </div>
              <div className="p-3.5 bg-amber-50/60 border border-amber-200/60 rounded-2xl text-center">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Water Conserved</span>
                <span className="text-lg font-black text-amber-900">+{activeModalMethod.waterSavingsLiters.toLocaleString()} L/kg</span>
              </div>
            </div>

            {/* 4-Step Operational Workflow */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-2">
                <Cpu className="h-4 w-4 text-primary-600" />
                <span>Standardized 4-Step Processing Workflow</span>
              </h3>
              <div className="space-y-2">
                {activeModalMethod.workflow.map((step, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700">
                    {step}
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Parameters Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-2">
                <Zap className="h-4 w-4 text-amber-600" />
                <span>Industrial Machinery & Chemical Reagents</span>
              </h3>
              <table className="w-full text-xs border border-slate-200 rounded-2xl overflow-hidden">
                <tbody className="divide-y divide-slate-100">
                  <tr className="bg-slate-50/60">
                    <td className="px-4 py-2.5 font-bold text-slate-500 w-1/3">Required Machinery</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-800">{activeModalMethod.equipment.join(', ')}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-bold text-slate-500">Chemical Reagents / Solvents</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-800">{activeModalMethod.reagents.join(', ')}</td>
                  </tr>
                  <tr className="bg-slate-50/60">
                    <td className="px-4 py-2.5 font-bold text-slate-500">Output Stream Products</td>
                    <td className="px-4 py-2.5 font-semibold text-emerald-700 font-bold">{activeModalMethod.outputs.join(', ')}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-bold text-slate-500">Primary Industrial Offtakers</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-800">{activeModalMethod.offtakers.join(', ')}</td>
                  </tr>
                  <tr className="bg-slate-50/60">
                    <td className="px-4 py-2.5 font-bold text-slate-500">Contamination Tolerance</td>
                    <td className="px-4 py-2.5 font-semibold text-amber-800 font-bold">{activeModalMethod.maxContamination}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-bold text-slate-500">Quality Spec Standard</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-800 font-mono text-[11px]">{activeModalMethod.qualitySpec}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Chemical Safety PPE Alert */}
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl space-y-1 text-xs">
              <span className="font-bold flex items-center space-x-1.5 text-rose-800">
                <ShieldCheck className="h-4 w-4 text-rose-600" />
                <span>Chemical Safety & PPE Protocol:</span>
              </span>
              <p className="font-semibold text-rose-700 pl-5 leading-normal">
                {activeModalMethod.safetyPpe}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-4 pt-2 border-t border-slate-100">
              <button
                onClick={() => handleDownloadSpec(activeModalMethod)}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl text-xs transition-all flex items-center justify-center space-x-2 shadow-md shadow-primary-200 cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Export Technical Spec Sheet</span>
              </button>
              <button
                onClick={() => setActiveModalMethod(null)}
                className="px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-xs transition-all cursor-pointer"
              >
                Close Modal
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default RecyclingCatalogPage;
