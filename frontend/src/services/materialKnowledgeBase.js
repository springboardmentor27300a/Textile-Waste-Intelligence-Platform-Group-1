/**
 * Material Knowledge Base Service
 * ==========================================
 * Contains detailed sustainability metrics, recycling assessment data,
 * features, and recommendations for 15 supported materials.
 */

export const MATERIAL_KNOWLEDGE_BASE = {
  Cotton: {
    description: "Cotton is a natural cellulose fiber obtained from cotton plants. It is highly breathable, soft, biodegradable, and widely used across the textile industry.",
    category: "Natural",
    source: "Plant",
    composition: { Cotton: 100 },
    applications: ["T-Shirts", "Shirts", "Bedsheets", "Denim", "Underwear", "Towels"],
    waste_info: {
      type: "Pre-consumer / Post-consumer",
      biodegradable: "Yes",
      decomposition_time: "2–5 months"
    },
    environmental_impact: {
      water_pollution: "High",
      air_pollution: "Low",
      carbon_emission: "Low",
      microplastic_release: "Low",
      landfill_impact: "Low"
    },
    recycling_assessment: {
      status: "Highly Recyclable",
      methods: ["Mechanical Recycling", "Fiber Recovery", "Chemical Recycling"],
      upcycling_opportunities: ["Cleaning Cloth", "Insulation", "Furniture Filling", "Paper Production"],
      score: 9.2,
      stars: 5
    },
    features: {
      physical_properties: {
        Softness: "High",
        Breathability: "High",
        Stretchability: "Low",
        "Moisture Absorption": "High",
        Weight: "Light to Medium",
        Texture: "Soft, smooth",
        Elasticity: "Low"
      },
      performance: {
        Durability: "Medium",
        "Wrinkle Resistance": "Low",
        "Heat Resistance": "High",
        "Water Resistance": "Low",
        "Abrasion Resistance": "Medium",
        "UV Resistance": "Medium"
      },
      care_instructions: {
        "Machine Wash": "Safe, warm water",
        "Hand Wash": "Safe",
        "Iron Temperature": "High (200°C)",
        "Drying Method": "Tumble dry / Air dry",
        "Bleaching Recommendation": "Safe for whites, avoid for colors"
      },
      advantages: ["Comfortable", "Eco-Friendly", "Highly Absorbent", "Soft", "Hypoallergenic"],
      limitations: ["Wrinkles Easily", "Shrinks in Hot Water", "Slow Drying"]
    },
    sustainability_metrics: {
      recyclability: 92,
      eco_friendliness: 85,
      durability: 65,
      carbon_impact: 88,
      water_consumption: 20, // Cotton is water-intensive to grow
      biodegradability: 100,
      circular_economy_score: 90,
      overall_sustainability_score: 82
    },
    comparison: {
      compare_with: "Polyester",
      advantages: ["✓ 100% biodegradable", "✓ Superior moisture absorption", "✓ Zero microplastic pollution"],
      limitations: ["✗ Higher water footprint in cultivation", "✗ Much lower wrinkle resistance", "✗ Lower tensile strength"]
    },
    recommendations: {
      best_disposal: "Mechanical Recycling / Composting",
      recycling_method: "Mechanical shredding to produce secondary coarse cotton fibers",
      reuse_possibility: "High",
      secondary_applications: ["Cleaning Cloths", "Acoustic Insulation", "Furniture Padding"]
    }
  },
  Polyester: {
    description: "Polyester is a synthetic petroleum-based polymer fiber. It is exceptionally durable, wrinkle-resistant, fast-drying, and does not shrink, making it highly versatile.",
    category: "Synthetic",
    source: "Petroleum",
    composition: { Polyester: 100 },
    applications: ["Activewear", "Jackets", "Fleeces", "Sportswear", "Bags", "Linings"],
    waste_info: {
      type: "Post-consumer",
      biodegradable: "No",
      decomposition_time: "20–200 years"
    },
    environmental_impact: {
      water_pollution: "Medium",
      air_pollution: "High",
      carbon_emission: "High",
      microplastic_release: "High",
      landfill_impact: "High"
    },
    recycling_assessment: {
      status: "Highly Recyclable",
      methods: ["Chemical Recycling", "Thermal Recovery", "Mechanical Recycling"],
      upcycling_opportunities: ["Industrial Padding", "Construction Felts", "RPET Bottles", "New Yarns"],
      score: 8.5,
      stars: 4
    },
    features: {
      physical_properties: {
        Softness: "Medium",
        Breathability: "Medium",
        Stretchability: "Medium",
        "Moisture Absorption": "Low",
        Weight: "Light",
        Texture: "Smooth, synthetic",
        Elasticity: "Medium"
      },
      performance: {
        Durability: "High",
        "Wrinkle Resistance": "High",
        "Heat Resistance": "Medium",
        "Water Resistance": "Medium",
        "Abrasion Resistance": "High",
        "UV Resistance": "High"
      },
      care_instructions: {
        "Machine Wash": "Safe, cold water",
        "Hand Wash": "Safe",
        "Iron Temperature": "Low (110°C)",
        "Drying Method": "Tumble dry low / Line dry",
        "Bleaching Recommendation": "Avoid chlorine bleach"
      },
      advantages: ["Durable", "Wrinkle-Free", "Fast Drying", "Lightweight", "Resistant to shrinking"],
      limitations: ["Non-biodegradable", "Releases microplastics", "Prone to static buildup"]
    },
    sustainability_metrics: {
      recyclability: 85,
      eco_friendliness: 30,
      durability: 95,
      carbon_impact: 25,
      water_consumption: 90, // Uses very little water compared to cotton
      biodegradability: 0,
      circular_economy_score: 80,
      overall_sustainability_score: 51
    },
    comparison: {
      compare_with: "Cotton",
      advantages: ["✓ Extremely durable and abrasion-resistant", "✓ Wrinkle-free and holds shape well", "✓ Very low cultivation water footprint"],
      limitations: ["✗ Will not biodegrade in landfills", "✗ Releases microplastics during washing", "✗ Poor moisture absorption and breathability"]
    },
    recommendations: {
      best_disposal: "Chemical Depolymerization / Fiber-to-Fiber Recycling",
      recycling_method: "Pelletizing and spinning into Recycled Polyester (rPET) fibers",
      reuse_possibility: "Medium",
      secondary_applications: ["Polyester insulation sheets", "Eco-packaging bags", "Carpet fibers"]
    }
  },
  Silk: {
    description: "Silk is a luxurious, natural protein fiber produced by silkworms. It has a high sheen, excellent drape, and provides exceptional temperature regulation.",
    category: "Natural",
    source: "Animal",
    composition: { Silk: 100 },
    applications: ["Dresses", "Blouses", "Scarves", "Lingerie", "Bedding", "Ties"],
    waste_info: {
      type: "Pre-consumer",
      biodegradable: "Yes",
      decomposition_time: "1–3 years"
    },
    environmental_impact: {
      water_pollution: "Low",
      air_pollution: "Low",
      carbon_emission: "Medium",
      microplastic_release: "Low",
      landfill_impact: "Low"
    },
    recycling_assessment: {
      status: "Moderately Recyclable",
      methods: ["Fiber Recovery", "Mechanical Recycling"],
      upcycling_opportunities: ["Fashion Accessories", "Embroidery Crafts", "Furniture Padding"],
      score: 6.8,
      stars: 3
    },
    features: {
      physical_properties: {
        Softness: "Excellent",
        Breathability: "High",
        Stretchability: "Medium",
        "Moisture Absorption": "High",
        Weight: "Ultra-Light",
        Texture: "Silky, smooth, lustrous",
        Elasticity: "High"
      },
      performance: {
        Durability: "Medium",
        "Wrinkle Resistance": "Medium",
        "Heat Resistance": "Low",
        "Water Resistance": "Low",
        "Abrasion Resistance": "Low",
        "UV Resistance": "Low"
      },
      care_instructions: {
        "Machine Wash": "Delicate cycle in mesh bag",
        "Hand Wash": "Recommended, cold water",
        "Iron Temperature": "Very Low (110°C, silk setting)",
        "Drying Method": "Air dry flat in shade",
        "Bleaching Recommendation": "Never bleach"
      },
      advantages: ["Luxurious Feel", "Temperature Regulating", "Hypoallergenic", "Highly Breathable", "Biodegradable"],
      limitations: ["Delicate", "Requires Special Care", "Prone to water spots", "High cost"]
    },
    sustainability_metrics: {
      recyclability: 68,
      eco_friendliness: 72,
      durability: 55,
      carbon_impact: 60,
      water_consumption: 65,
      biodegradability: 100,
      circular_economy_score: 70,
      overall_sustainability_score: 73
    },
    comparison: {
      compare_with: "Polyester",
      advantages: ["✓ Completely natural & biodegradable", "✓ Exceptionally breathable and comfortable", "✓ Zero microplastic shedding"],
      limitations: ["✗ Highly delicate compared to synthetic durability", "✗ Requires dry cleaning or delicate handwashing", "✗ Low abrasion and tear resistance"]
    },
    recommendations: {
      best_disposal: "Fiber extraction for reuse",
      recycling_method: "Mechanical pulling to recover premium silk fibers for secondary textiles",
      reuse_possibility: "High",
      secondary_applications: ["Premium padding", "Artisan textile crafts", "Quilt linings"]
    }
  },
  Wool: {
    description: "Wool is a natural protein fiber obtained from sheep or goats. It features natural crimp and scales, providing superior warmth, insulation, moisture management, and flame resistance.",
    category: "Natural",
    source: "Animal",
    composition: { Wool: 100 },
    applications: ["Sweaters", "Coats", "Blankets", "Socks", "Suits", "Carpets"],
    waste_info: {
      type: "Pre-consumer / Post-consumer",
      biodegradable: "Yes",
      decomposition_time: "1–5 years"
    },
    environmental_impact: {
      water_pollution: "Low",
      air_pollution: "Low",
      carbon_emission: "Medium",
      microplastic_release: "Low",
      landfill_impact: "Low"
    },
    recycling_assessment: {
      status: "Highly Recyclable",
      methods: ["Mechanical Recycling", "Fiber Recovery"],
      upcycling_opportunities: ["Acoustic Insulation", "Wool Felts", "Mattress Filling", "Industrial Rugs"],
      score: 8.8,
      stars: 4
    },
    features: {
      physical_properties: {
        Softness: "Medium to High",
        Breathability: "High",
        Stretchability: "High",
        "Moisture Absorption": "Excellent",
        Weight: "Medium to Heavy",
        Texture: "Crimp, coarse or soft",
        Elasticity: "High"
      },
      performance: {
        Durability: "High",
        "Wrinkle Resistance": "Excellent",
        "Heat Resistance": "Medium",
        "Water Resistance": "Medium",
        "Abrasion Resistance": "High",
        "UV Resistance": "High"
      },
      care_instructions: {
        "Machine Wash": "Wool cycle only, cold water",
        "Hand Wash": "Highly recommended",
        "Iron Temperature": "Medium (150°C)",
        "Drying Method": "Dry flat to prevent stretching",
        "Bleaching Recommendation": "Never bleach"
      },
      advantages: ["Excellent Warmth", "Flame Resistant", "Wrinkle Resistant", "Highly Resilient", "Eco-Friendly"],
      limitations: ["Can be itchy", "Shrinks/felts in hot water", "Attractive to moths"]
    },
    sustainability_metrics: {
      recyclability: 88,
      eco_friendliness: 80,
      durability: 88,
      carbon_impact: 68,
      water_consumption: 60,
      biodegradability: 100,
      circular_economy_score: 85,
      overall_sustainability_score: 81
    },
    comparison: {
      compare_with: "Acrylic",
      advantages: ["✓ Natural thermoregulation and breathability", "✓ Naturally flame-retardant without chemicals", "✓ Fully biodegradable at end-of-life"],
      limitations: ["✗ Significantly higher cost than synthetic acrylic", "✗ Can shrink dramatically if washed incorrectly", "✗ Susceptible to moth damage during storage"]
    },
    recommendations: {
      best_disposal: "Mechanical Recycling for secondary yarns",
      recycling_method: "Mechanical shredding and re-spinning into recycled wool insulation or yarns",
      reuse_possibility: "High",
      secondary_applications: ["Sound insulation panels", "Horticultural mulch mats", "Underlay felts"]
    }
  },
  Linen: {
    description: "Linen is a natural plant-based fiber derived from the flax plant. It is renowned for its exceptional freshness in hot weather, strength, durability, and rapid drying capability.",
    category: "Natural",
    source: "Plant",
    composition: { Linen: 100 },
    applications: ["Summer Shirts", "Dresses", "Trousers", "Tablecloths", "Bedding", "Napkins"],
    waste_info: {
      type: "Pre-consumer / Post-consumer",
      biodegradable: "Yes",
      decomposition_time: "2 weeks to 3 months"
    },
    environmental_impact: {
      water_pollution: "Low",
      air_pollution: "Low",
      carbon_emission: "Low",
      microplastic_release: "Low",
      landfill_impact: "Low"
    },
    recycling_assessment: {
      status: "Highly Recyclable",
      methods: ["Mechanical Recycling", "Fiber Recovery", "Industrial Composting"],
      upcycling_opportunities: ["High-grade Paper", "Reinforcements", "Cleaning Cloths", "Insulation"],
      score: 9.5,
      stars: 5
    },
    features: {
      physical_properties: {
        Softness: "Medium (softens with washes)",
        Breathability: "Excellent",
        Stretchability: "Low",
        "Moisture Absorption": "Excellent",
        Weight: "Light to Medium",
        Texture: "Crisp, textured slubs",
        Elasticity: "Low"
      },
      performance: {
        Durability: "Excellent",
        "Wrinkle Resistance": "Low",
        "Heat Resistance": "Excellent",
        "Water Resistance": "Low",
        "Abrasion Resistance": "High",
        "UV Resistance": "High"
      },
      care_instructions: {
        "Machine Wash": "Safe, warm or cold water",
        "Hand Wash": "Safe",
        "Iron Temperature": "High (220°C, damp)",
        "Drying Method": "Line dry",
        "Bleaching Recommendation": "Avoid bleach to protect flax fibers"
      },
      advantages: ["Cooling Effect", "Extremely Strong", "Dries Quickly", "Highly Sustainable", "Biodegradable"],
      limitations: ["Creases heavily", "Low elasticity makes it stiff", "Initially coarse to touch"]
    },
    sustainability_metrics: {
      recyclability: 95,
      eco_friendliness: 95,
      durability: 90,
      carbon_impact: 92,
      water_consumption: 85, // Flax requires very little water or chemicals to grow
      biodegradability: 100,
      circular_economy_score: 95,
      overall_sustainability_score: 92
    },
    comparison: {
      compare_with: "Cotton",
      advantages: ["✓ Higher durability and tensile strength", "✓ Much lower water and chemical footprint during cultivation", "✓ Dries faster and feels cooler in high heat"],
      limitations: ["✗ Creases and wrinkles far more easily", "✗ Higher initial stiffness and cost", "✗ Lower elasticity limits garment styles"]
    },
    recommendations: {
      best_disposal: "Mechanical Recycling / Industrial Composting",
      recycling_method: "Mechanical fiber retrieval for paper composites or blended eco-threads",
      reuse_possibility: "High",
      secondary_applications: ["Premium organic paper", "Acoustic backing panels", "Eco-composites"]
    }
  },
  Rayon: {
    description: "Rayon is a semi-synthetic fiber produced from regenerated cellulose (typically wood pulp). It mimics the feel of silk, cotton, or linen while remaining highly absorbent and soft.",
    category: "Semi-synthetic",
    source: "Bio-based",
    composition: { Rayon: 100 },
    applications: ["Blouses", "Summer Dresses", "Linings", "Activewear", "Drapes", "Wipes"],
    waste_info: {
      type: "Pre-consumer / Post-consumer",
      biodegradable: "Yes",
      decomposition_time: "6–12 weeks"
    },
    environmental_impact: {
      water_pollution: "High",
      air_pollution: "Medium",
      carbon_emission: "Medium",
      microplastic_release: "Low",
      landfill_impact: "Low"
    },
    recycling_assessment: {
      status: "Moderately Recyclable",
      methods: ["Chemical Recycling", "Fiber Recovery"],
      upcycling_opportunities: ["Cleaning Wipes", "Insulation", "Filler Material"],
      score: 7.2,
      stars: 3
    },
    features: {
      physical_properties: {
        Softness: "High",
        Breathability: "High",
        Stretchability: "Low",
        "Moisture Absorption": "High",
        Weight: "Light to Medium",
        Texture: "Soft, silky drape",
        Elasticity: "Low"
      },
      performance: {
        Durability: "Low to Medium",
        "Wrinkle Resistance": "Low",
        "Heat Resistance": "Medium",
        "Water Resistance": "Low",
        "Abrasion Resistance": "Low",
        "UV Resistance": "Medium"
      },
      care_instructions: {
        "Machine Wash": "Gentle cycle, cold water",
        "Hand Wash": "Recommended to avoid shrinking",
        "Iron Temperature": "Medium (150°C)",
        "Drying Method": "Line dry flat",
        "Bleaching Recommendation": "Do not bleach"
      },
      advantages: ["Silky Texture", "Drapes Beautifully", "Highly Absorbent", "Comfortable", "Biodegradable"],
      limitations: ["Loses strength when wet", "Shrinks easily", "Prone to wrinkling"]
    },
    sustainability_metrics: {
      recyclability: 72,
      eco_friendliness: 55,
      durability: 45,
      carbon_impact: 62,
      water_consumption: 50, // Chemical processing is water and chemical intensive
      biodegradability: 100,
      circular_economy_score: 75,
      overall_sustainability_score: 64
    },
    comparison: {
      compare_with: "Polyester",
      advantages: ["✓ Made from renewable bio-based wood pulp", "✓ Fully biodegradable at end of life", "✓ Superior breathability and moisture absorption"],
      limitations: ["✗ Significantly weaker, especially when wet", "✗ High chemical discharge during manufacturing", "✗ Requires much gentler wash care"]
    },
    recommendations: {
      best_disposal: "Chemical dissolution for regeneration",
      recycling_method: "Chemical recycling to re-extract pure cellulose pulp for secondary rayon fibers",
      reuse_possibility: "Medium",
      secondary_applications: ["Biodegradable wipes", "Industrial insulation filling", "Coarse rags"]
    }
  },
  Denim: {
    description: "Denim is a durable, natural cotton-based twill fabric woven with indigo-dyed warp and white weft threads. It is exceptionally strong, robust, and gains character with age.",
    category: "Natural",
    source: "Plant",
    composition: { Cotton: 100 },
    applications: ["Jeans", "Jackets", "Skirts", "Bags", "Workwear", "Caps"],
    waste_info: {
      type: "Post-consumer",
      biodegradable: "Yes",
      decomposition_time: "10–12 months"
    },
    environmental_impact: {
      water_pollution: "High",
      air_pollution: "Low",
      carbon_emission: "Low",
      microplastic_release: "Low",
      landfill_impact: "Low"
    },
    recycling_assessment: {
      status: "Highly Recyclable",
      methods: ["Mechanical Recycling", "Fiber Recovery", "Shredding"],
      upcycling_opportunities: ["Building Insulation", "Furniture Stuffing", "Denim Yarn", "Packaging Felt"],
      score: 9.0,
      stars: 5
    },
    features: {
      physical_properties: {
        Softness: "Medium (softens with wear)",
        Breathability: "Medium",
        Stretchability: "Low (unless elastane blended)",
        "Moisture Absorption": "High",
        Weight: "Heavy",
        Texture: "Coarse, diagonal twill",
        Elasticity: "Low"
      },
      performance: {
        Durability: "Excellent",
        "Wrinkle Resistance": "Medium",
        "Heat Resistance": "High",
        "Water Resistance": "Low",
        "Abrasion Resistance": "Excellent",
        "UV Resistance": "High"
      },
      care_instructions: {
        "Machine Wash": "Safe, inside out, cold water",
        "Hand Wash": "Safe",
        "Iron Temperature": "High (200°C)",
        "Drying Method": "Line dry in shade to preserve indigo",
        "Bleaching Recommendation": "Avoid bleaching"
      },
      advantages: ["Extremely Durable", "Classic Aesthetic", "High Abrasion Resistance", "Biodegradable", "Strong"],
      limitations: ["Heavy when wet", "Indigo dye can bleed", "Stiff initially"]
    },
    sustainability_metrics: {
      recyclability: 90,
      eco_friendliness: 82,
      durability: 95,
      carbon_impact: 85,
      water_consumption: 25, // Denim dye and finish processes are very water intensive
      biodegradability: 100,
      circular_economy_score: 92,
      overall_sustainability_score: 81
    },
    comparison: {
      compare_with: "Polyester Canvas",
      advantages: ["✓ Plant-based cotton substrate is biodegradable", "✓ Very high resistance to ripping and tearing", "✓ Develops unique wear patterns rather than fraying"],
      limitations: ["✗ Takes a very long time to dry", "✗ Higher water consumption in dye finishing", "✗ Heavier weight reduces comfort in humid conditions"]
    },
    recommendations: {
      best_disposal: "Mechanical shredding for insulation",
      recycling_method: "Shredding into raw fibers to produce premium acoustic insulation or recycled jeans yarns",
      reuse_possibility: "High",
      secondary_applications: ["Eco-friendly building insulation", "Industrial moving blankets", "Packaging shock pads"]
    }
  },
  Nylon: {
    description: "Nylon is an exceptionally strong, elastic, and lightweight synthetic polyamide fiber. It offers superior abrasion resistance and is widely used in high-performance garments.",
    category: "Synthetic",
    source: "Petroleum",
    composition: { Nylon: 100 },
    applications: ["Swimwear", "Stockings", "Activewear", "Windbreakers", "Ropes", "Parachutes"],
    waste_info: {
      type: "Post-consumer",
      biodegradable: "No",
      decomposition_time: "30–40 years"
    },
    environmental_impact: {
      water_pollution: "Medium",
      air_pollution: "High",
      carbon_emission: "High",
      microplastic_release: "High",
      landfill_impact: "High"
    },
    recycling_assessment: {
      status: "Highly Recyclable",
      methods: ["Chemical Recycling", "Thermal Recovery", "Mechanical Recycling"],
      upcycling_opportunities: ["Econyl Yarns", "Carpet Fibers", "Molded Plastics", "Industrial Parts"],
      score: 8.8,
      stars: 4
    },
    features: {
      physical_properties: {
        Softness: "Medium",
        Breathability: "Low to Medium",
        Stretchability: "High",
        "Moisture Absorption": "Low",
        Weight: "Light",
        Texture: "Smooth, synthetic, slippery",
        Elasticity: "High"
      },
      performance: {
        Durability: "Excellent",
        "Wrinkle Resistance": "Excellent",
        "Heat Resistance": "Low",
        "Water Resistance": "High",
        "Abrasion Resistance": "Excellent",
        "UV Resistance": "Medium"
      },
      care_instructions: {
        "Machine Wash": "Safe, cold water, gentle cycle",
        "Hand Wash": "Safe",
        "Iron Temperature": "Low (110°C, nylon setting)",
        "Drying Method": "Air dry / tumble dry low",
        "Bleaching Recommendation": "Avoid bleach"
      },
      advantages: ["High Strength", "Elastic", "Water Resistant", "Lightweight", "Extreme Abrasion Resistance"],
      limitations: ["Non-biodegradable", "Melts under high heat", "Static electricity generator"]
    },
    sustainability_metrics: {
      recyclability: 88,
      eco_friendliness: 28,
      durability: 98,
      carbon_impact: 22,
      water_consumption: 85,
      biodegradability: 0,
      circular_economy_score: 84,
      overall_sustainability_score: 50
    },
    comparison: {
      compare_with: "Polyester",
      advantages: ["✓ Superior elasticity and tensile strength", "✓ Much higher abrasion and wear resistance", "✓ Lighter weight for high-performance applications"],
      limitations: ["✗ Slightly more difficult to dye evenly", "✗ Poorer UV resistance over long exposures", "✗ Melts at a lower temperature"]
    },
    recommendations: {
      best_disposal: "Chemical depolymerization (Econyl loop)",
      recycling_method: "Chemical recycling to yield nylon pellets for high-tensile technical yarns",
      reuse_possibility: "Medium",
      secondary_applications: ["Recycled fishing nets", "Engineered plastic parts", "Industrial straps"]
    }
  },
  Acrylic: {
    description: "Acrylic is a synthetic polymer fiber made from acrylonitrile. It closely mimics the warmth, softness, and loft of natural wool while being lightweight, hypoallergenic, and mildew-resistant.",
    category: "Synthetic",
    source: "Petroleum",
    composition: { Acrylic: 100 },
    applications: ["Sweaters", "Blankets", "Carpets", "Awnings", "Faux Fur", "Hats"],
    waste_info: {
      type: "Post-consumer",
      biodegradable: "No",
      decomposition_time: "200+ years"
    },
    environmental_impact: {
      water_pollution: "High",
      air_pollution: "High",
      carbon_emission: "High",
      microplastic_release: "High",
      landfill_impact: "High"
    },
    recycling_assessment: {
      status: "Difficult to Recycle",
      methods: ["Mechanical Recycling", "Thermal Recovery"],
      upcycling_opportunities: ["Insulation Felts", "Coarse Mats", "Industrial Stuffing"],
      score: 4.2,
      stars: 2
    },
    features: {
      physical_properties: {
        Softness: "High",
        Breathability: "Low",
        Stretchability: "Medium",
        "Moisture Absorption": "Low",
        Weight: "Light",
        Texture: "Wool-like, soft, fuzzy",
        Elasticity: "Medium"
      },
      performance: {
        Durability: "Medium",
        "Wrinkle Resistance": "High",
        "Heat Resistance": "Low",
        "Water Resistance": "Medium",
        "Abrasion Resistance": "Medium",
        "UV Resistance": "Excellent"
      },
      care_instructions: {
        "Machine Wash": "Safe, warm water, gentle cycle",
        "Hand Wash": "Safe",
        "Iron Temperature": "Avoid iron / Cool iron if necessary",
        "Drying Method": "Tumble dry low / Dry flat",
        "Bleaching Recommendation": "Do not bleach"
      },
      advantages: ["Warm & Wool-like", "Lightweight", "Hypoallergenic", "Resistant to moths/sunlight", "Vibrant colors"],
      limitations: ["Extremely slow to biodegrade", "Pills easily", "Highly flammable unless treated"]
    },
    sustainability_metrics: {
      recyclability: 42,
      eco_friendliness: 22,
      durability: 70,
      carbon_impact: 18,
      water_consumption: 80,
      biodegradability: 0,
      circular_economy_score: 40,
      overall_sustainability_score: 38
    },
    comparison: {
      compare_with: "Wool",
      advantages: ["✓ Hypoallergenic (no skin scratching)", "✓ Resistant to moth damage and mildew", "✓ Retains bright chemical dye colors exceptionally well"],
      limitations: ["✗ Zero biodegradability; persists in landfills indefinitely", "✗ High pill formation rate", "✗ Poor insulation when wet compared to dry wool"]
    },
    recommendations: {
      best_disposal: "Thermal Recovery / Energy Harvesting",
      recycling_method: "Mechanical shredding for carpet underlays or construction fiber boards",
      reuse_possibility: "Medium",
      secondary_applications: ["Carpet underlay pads", "Non-woven acoustic felts", "Industrial wiping mats"]
    }
  },
  Hemp: {
    description: "Hemp is an exceptionally sustainable, natural bast fiber from the stems of the Cannabis sativa plant. It is highly durable, antimicrobial, breathable, and grows with minimal environmental footprint.",
    category: "Natural",
    source: "Plant",
    composition: { Hemp: 100 },
    applications: ["Canvas", "Ropes", "Shirts", "Jeans", "Home Textiles", "Industrial Fabrics"],
    waste_info: {
      type: "Pre-consumer",
      biodegradable: "Yes",
      decomposition_time: "2–4 weeks"
    },
    environmental_impact: {
      water_pollution: "Low",
      air_pollution: "Low",
      carbon_emission: "Low",
      microplastic_release: "Low",
      landfill_impact: "Low"
    },
    recycling_assessment: {
      status: "Highly Recyclable",
      methods: ["Mechanical Recycling", "Fiber Recovery", "Composting"],
      upcycling_opportunities: ["Hempcrete Building", "Paper Pulp", "Reinforcement Composites", "Bio-plastics"],
      score: 9.8,
      stars: 5
    },
    features: {
      physical_properties: {
        Softness: "Medium (softens with wear)",
        Breathability: "Excellent",
        Stretchability: "Low",
        "Moisture Absorption": "High",
        Weight: "Medium",
        Texture: "Linen-like, slightly coarse",
        Elasticity: "Low"
      },
      performance: {
        Durability: "Excellent",
        "Wrinkle Resistance": "Low",
        "Heat Resistance": "Excellent",
        "Water Resistance": "Medium",
        "Abrasion Resistance": "Excellent",
        "UV Resistance": "Excellent"
      },
      care_instructions: {
        "Machine Wash": "Safe, warm water",
        "Hand Wash": "Safe",
        "Iron Temperature": "High (200°C)",
        "Drying Method": "Line dry / Tumble dry",
        "Bleaching Recommendation": "Avoid bleach to prevent fiber damage"
      },
      advantages: ["Antimicrobial", "Extremely Strong", "Highly Sustainable", "UV Protection", "Biodegradable"],
      limitations: ["Creases easily", "Coarse texture initially", "Higher cost due to regulation"]
    },
    sustainability_metrics: {
      recyclability: 98,
      eco_friendliness: 99,
      durability: 95,
      carbon_impact: 98,
      water_consumption: 92, // Requires 50% less water than cotton
      biodegradability: 100,
      circular_economy_score: 96,
      overall_sustainability_score: 96
    },
    comparison: {
      compare_with: "Cotton",
      advantages: ["✓ Almost double the durability and strength", "✓ Requires minimal water and zero pesticides to cultivate", "✓ Excellent natural antimicrobial/mold resistance"],
      limitations: ["✗ Harder and coarser fiber texture out of the box", "✗ Higher manufacturing and processing costs", "✗ Less elastic wrap"]
    },
    recommendations: {
      best_disposal: "Mechanical Shredding / Composting",
      recycling_method: "Mechanical fiber recovery for bio-composite reinforcement or eco-twines",
      reuse_possibility: "High",
      secondary_applications: ["Eco-construction composites (Hempcrete)", "Geotextile weed mats", "Hemp paper"]
    }
  },
  Jute: {
    description: "Jute is a coarse, natural bast fiber extracted from the bark of the jute plant. Frequently referred to as the 'golden fiber', it is highly durable, affordable, and fully biodegradable.",
    category: "Natural",
    source: "Plant",
    composition: { Jute: 100 },
    applications: ["Burlap Bags", "Twine", "Carpets", "Geotextiles", "Industrial Packaging"],
    waste_info: {
      type: "Pre-consumer",
      biodegradable: "Yes",
      decomposition_time: "1–2 months"
    },
    environmental_impact: {
      water_pollution: "Low",
      air_pollution: "Low",
      carbon_emission: "Low",
      microplastic_release: "Low",
      landfill_impact: "Low"
    },
    recycling_assessment: {
      status: "Highly Recyclable",
      methods: ["Mechanical Recycling", "Composting", "Shredding"],
      upcycling_opportunities: ["Agricultural Mats", "Composite Boards", "Biodegradable Twine", "Paper Pulp"],
      score: 9.6,
      stars: 5
    },
    features: {
      physical_properties: {
        Softness: "Low",
        Breathability: "Medium",
        Stretchability: "Low",
        "Moisture Absorption": "High",
        Weight: "Heavy",
        Texture: "Rough, coarse, fibrous",
        Elasticity: "Low"
      },
      performance: {
        Durability: "High",
        "Wrinkle Resistance": "Low",
        "Heat Resistance": "Excellent",
        "Water Resistance": "Low",
        "Abrasion Resistance": "Medium",
        "UV Resistance": "High"
      },
      care_instructions: {
        "Machine Wash": "Not recommended (structural breakdown)",
        "Hand Wash": "Spot clean only with damp cloth",
        "Iron Temperature": "Avoid iron / low steam if needed",
        "Drying Method": "Air dry flat",
        "Bleaching Recommendation": "Do not bleach"
      },
      advantages: ["Very Eco-Friendly", "Inexpensive", "Extremely Biodegradable", "Strong Tensile Strength"],
      limitations: ["Rough texture", "Sheds fibers", "Discolors when exposed to water"]
    },
    sustainability_metrics: {
      recyclability: 96,
      eco_friendliness: 96,
      durability: 82,
      carbon_impact: 95,
      water_consumption: 90, // Grows primarily in monsoon climates, rain-fed
      biodegradability: 100,
      circular_economy_score: 95,
      overall_sustainability_score: 93
    },
    comparison: {
      compare_with: "Polypropylene (Plastic Bag)",
      advantages: ["✓ Fully biodegradable (adds nutrients back to soil)", "✓ 100% natural, renewable agricultural source", "✓ High thermal insulation properties"],
      limitations: ["✗ Significantly coarser and rougher", "✗ Absorbs water easily, making it heavy and prone to rot", "✗ Fails to provide water resistance"]
    },
    recommendations: {
      best_disposal: "Composting / Natural Biodegradation",
      recycling_method: "Mechanical shredding to manufacture erosion control geotextiles",
      reuse_possibility: "High",
      secondary_applications: ["Land stabilization geotextiles", "Nursery root-ball wraps", "Coarse rope twine"]
    }
  },
  Bamboo: {
    description: "Bamboo fabric is typically a semi-synthetic regenerated viscose or natural linen-like fiber processed from bamboo grass. It is incredibly soft, breathable, and features natural moisture-wicking.",
    category: "Semi-synthetic",
    source: "Bio-based",
    composition: { Bamboo: 100 },
    applications: ["Underwear", "Socks", "Bedsheets", "Activewear", "T-Shirts", "Towels"],
    waste_info: {
      type: "Pre-consumer",
      biodegradable: "Yes",
      decomposition_time: "1–3 months"
    },
    environmental_impact: {
      water_pollution: "High",
      air_pollution: "Medium",
      carbon_emission: "Low",
      microplastic_release: "Low",
      landfill_impact: "Low"
    },
    recycling_assessment: {
      status: "Highly Recyclable",
      methods: ["Chemical Recycling", "Mechanical Recycling", "Composting"],
      upcycling_opportunities: ["Paper Making", "Cleaning Rags", "Eco-insulation"],
      score: 8.0,
      stars: 4
    },
    features: {
      physical_properties: {
        Softness: "Excellent",
        Breathability: "Excellent",
        Stretchability: "Low (unless elastane blended)",
        "Moisture Absorption": "Excellent",
        Weight: "Light to Medium",
        Texture: "Ultra-soft, silky",
        Elasticity: "Low"
      },
      performance: {
        Durability: "Medium",
        "Wrinkle Resistance": "Medium",
        "Heat Resistance": "Medium",
        "Water Resistance": "Low",
        "Abrasion Resistance": "Medium",
        "UV Resistance": "High"
      },
      care_instructions: {
        "Machine Wash": "Safe, cold water, delicate cycle",
        "Hand Wash": "Safe",
        "Iron Temperature": "Low (110°C)",
        "Drying Method": "Line dry flat",
        "Bleaching Recommendation": "Avoid chlorine bleach"
      },
      advantages: ["Silky Soft", "Breathable", "Antibacterial Properties", "Fast Growing Source", "Biodegradable"],
      limitations: ["Chemical intensive chemical process", "Shrinks easily", "Loses strength when wet"]
    },
    sustainability_metrics: {
      recyclability: 80,
      eco_friendliness: 70,
      durability: 60,
      carbon_impact: 85,
      water_consumption: 75, // Bamboo cultivation requires very little water, but process does
      biodegradability: 100,
      circular_economy_score: 82,
      overall_sustainability_score: 79
    },
    comparison: {
      compare_with: "Cotton",
      advantages: ["✓ Far softer texture resembling cashmere", "✓ Bamboo crop grows without pesticides or excessive watering", "✓ Higher water absorbency rate"],
      limitations: ["✗ Requires strong chemical solvents to turn woody stalks into fiber", "✗ Lower durability when wet", "✗ Prone to fabric pilling over time"]
    },
    recommendations: {
      best_disposal: "Chemical recovery or Composting",
      recycling_method: "Chemical dissolving to regenerate soft organic cellulose fibers",
      reuse_possibility: "High",
      secondary_applications: ["Ultra-soft cleaning towels", "Biodegradable hygiene products", "Compost bags"]
    }
  },
  Viscose: {
    description: "Viscose is a type of semi-synthetic rayon fabric made from regenerated wood cellulose. It has a silky aesthetic and texture, drapes beautifully, and is highly comfortable to wear.",
    category: "Semi-synthetic",
    source: "Bio-based",
    composition: { Viscose: 100 },
    applications: ["Blouses", "Dresses", "Linings", "Jackets", "Bedding", "T-Shirts"],
    waste_info: {
      type: "Pre-consumer",
      biodegradable: "Yes",
      decomposition_time: "1–2 months"
    },
    environmental_impact: {
      water_pollution: "High",
      air_pollution: "Medium",
      carbon_emission: "Medium",
      microplastic_release: "Low",
      landfill_impact: "Low"
    },
    recycling_assessment: {
      status: "Moderately Recyclable",
      methods: ["Chemical Recycling", "Fiber Recovery"],
      upcycling_opportunities: ["Cleaning Cloths", "Industrial Stuffing", "Packaging Felt"],
      score: 7.0,
      stars: 3
    },
    features: {
      physical_properties: {
        Softness: "High",
        Breathability: "High",
        Stretchability: "Low",
        "Moisture Absorption": "High",
        Weight: "Light to Medium",
        Texture: "Smooth, silk-like drape",
        Elasticity: "Low"
      },
      performance: {
        Durability: "Low to Medium",
        "Wrinkle Resistance": "Low",
        "Heat Resistance": "Medium",
        "Water Resistance": "Low",
        "Abrasion Resistance": "Low",
        "UV Resistance": "Medium"
      },
      care_instructions: {
        "Machine Wash": "Safe on delicate, cold water",
        "Hand Wash": "Recommended",
        "Iron Temperature": "Low to Medium (120°C)",
        "Drying Method": "Line dry flat",
        "Bleaching Recommendation": "Do not bleach"
      },
      advantages: ["Silky Texture", "Drapes Elegantly", "Breathable", "Anti-static", "Biodegradable"],
      limitations: ["Wrinkles easily", "Weak when wet", "High shrinkage rates"]
    },
    sustainability_metrics: {
      recyclability: 70,
      eco_friendliness: 52,
      durability: 48,
      carbon_impact: 60,
      water_consumption: 55,
      biodegradability: 100,
      circular_economy_score: 72,
      overall_sustainability_score: 63
    },
    comparison: {
      compare_with: "Silk",
      advantages: ["✓ Much lower cost while maintaining silk-like drape", "✓ Easier to dye and print vibrant patterns on", "✓ Bio-based cellulose substrate"],
      limitations: ["✗ Significantly lower strength and durability than silk", "✗ Synthetic chemical process creates hazardous waste if unmanaged", "✗ Prone to stretching out of shape"]
    },
    recommendations: {
      best_disposal: "Chemical recycling to extract cellulose pulp",
      recycling_method: "Chemical extraction to re-spin premium viscose threads",
      reuse_possibility: "Medium",
      secondary_applications: ["Industrial wipes", "Acoustic felts", "Cushion padding"]
    }
  },
  Spandex: {
    description: "Spandex (also known as elastane or Lycra) is a synthetic polyurethane polyurea copolymer fiber. It is renowned for its exceptional elasticity, capable of stretching up to 500% without breaking.",
    category: "Synthetic",
    source: "Petroleum",
    composition: { Spandex: 100 },
    applications: ["Leggings", "Swimwear", "Activewear", "Underwear", "Elastic Waistbands", "Compression Wear"],
    waste_info: {
      type: "Post-consumer",
      biodegradable: "No",
      decomposition_time: "50–150 years"
    },
    environmental_impact: {
      water_pollution: "Medium",
      air_pollution: "High",
      carbon_emission: "High",
      microplastic_release: "High",
      landfill_impact: "High"
    },
    recycling_assessment: {
      status: "Difficult to Recycle",
      methods: ["Thermal Recovery", "Mechanical Sorting (if blended)"],
      upcycling_opportunities: ["Elastic Blends", "Industrial Padding", "Bungee cords"],
      score: 3.5,
      stars: 1
    },
    features: {
      physical_properties: {
        Softness: "Medium",
        Breathability: "Low",
        Stretchability: "Exceptional",
        "Moisture Absorption": "Low",
        Weight: "Light",
        Texture: "Slick, stretchy, rubbery",
        Elasticity: "Exceptional"
      },
      performance: {
        Durability: "High",
        "Wrinkle Resistance": "Excellent",
        "Heat Resistance": "Low",
        "Water Resistance": "Medium",
        "Abrasion Resistance": "High",
        "UV Resistance": "High"
      },
      care_instructions: {
        "Machine Wash": "Safe in cold water, avoid fabric softener",
        "Hand Wash": "Safe",
        "Iron Temperature": "Do not iron",
        "Drying Method": "Air dry recommended (heat breaks down spandex)",
        "Bleaching Recommendation": "Never bleach"
      },
      advantages: ["Extreme Stretchability", "Excellent Recovery", "Lightweight", "Wrinkle Resistant", "Chlorine Resistant"],
      limitations: ["Trap heat and sweat", "Fragile under heat", "Highly difficult to recycle"]
    },
    sustainability_metrics: {
      recyclability: 35,
      eco_friendliness: 20,
      durability: 82,
      carbon_impact: 20,
      water_consumption: 82,
      biodegradability: 0,
      circular_economy_score: 30,
      overall_sustainability_score: 36
    },
    comparison: {
      compare_with: "Nylon",
      advantages: ["✓ Far superior stretch and shape recovery", "✓ Lower friction factor for compression fit", "✓ Highly resistant to body oils and sweat degradation"],
      limitations: ["✗ Extremely low recyclability due to copolymer complexity", "✗ Poor insulation capabilities", "✗ Breaks down rapidly when dried in hot dryers"]
    },
    recommendations: {
      best_disposal: "Thermal Recovery (Waste-to-Energy)",
      recycling_method: "Co-incineration in energy recovery systems due to recycling limitations",
      reuse_possibility: "Low",
      secondary_applications: ["Elastic shock bindings", "Industrial elastic gaskets", "Felt padding blends"]
    }
  },
  "Blended Fabrics": {
    description: "Blended Fabrics combine two or more distinct fibers (frequently natural cotton and synthetic polyester) to yield a textile with balanced properties, comfort, and durability.",
    category: "Blend",
    source: "Mixed Sources",
    composition: { Cotton: 60, Polyester: 40 },
    applications: ["Casual Wear", "School Uniforms", "Bed Linens", "Socks", "Work Shirts", "Sportswear"],
    waste_info: {
      type: "Post-consumer",
      biodegradable: "No (if synthetic components exist)",
      decomposition_time: "50–150 years (depending on blend)"
    },
    environmental_impact: {
      water_pollution: "Medium",
      air_pollution: "High",
      carbon_emission: "High",
      microplastic_release: "High",
      landfill_impact: "High"
    },
    recycling_assessment: {
      status: "Difficult to Recycle",
      methods: ["Mechanical Shredding", "Chemical Separation", "Thermal Recovery"],
      upcycling_opportunities: ["Furniture Stuffing", "Shoddy Fiber Yarns", "Industrial Felts", "Wiping Rags"],
      score: 4.5,
      stars: 2
    },
    features: {
      physical_properties: {
        Softness: "Medium to High",
        Breathability: "Medium",
        Stretchability: "Low to Medium",
        "Moisture Absorption": "Medium",
        Weight: "Medium",
        Texture: "Variable texture",
        Elasticity: "Low to Medium"
      },
      performance: {
        Durability: "High",
        "Wrinkle Resistance": "Medium",
        "Heat Resistance": "Medium",
        "Water Resistance": "Low to Medium",
        "Abrasion Resistance": "High",
        "UV Resistance": "Medium"
      },
      care_instructions: {
        "Machine Wash": "Safe, warm or cold water",
        "Hand Wash": "Safe",
        "Iron Temperature": "Medium (150°C)",
        "Drying Method": "Tumble dry / line dry",
        "Bleaching Recommendation": "Avoid chlorine bleaching"
      },
      advantages: ["Wrinkle Resistant", "Durable", "Comfortable Blend", "Shrink Resistant", "Cost-effective"],
      limitations: ["Extremely difficult to separate fibers", "Releases microplastics", "Non-biodegradable synthetic components"]
    },
    sustainability_metrics: {
      recyclability: 45,
      eco_friendliness: 40,
      durability: 85,
      carbon_impact: 42,
      water_consumption: 55,
      biodegradability: 30, // Only natural components will degrade
      circular_economy_score: 40,
      overall_sustainability_score: 48
    },
    comparison: {
      compare_with: "100% Cotton",
      advantages: ["✓ Much less prone to shrinking and wrinkling", "✓ Dries significantly faster", "✓ Lower purchase price and longer wear life"],
      limitations: ["✗ Cannot be easily recycled or composted", "✗ Sheds synthetic microplastics", "✗ Lower overall moisture absorbency"]
    },
    recommendations: {
      best_disposal: "Mechanical shredding for secondary fibers",
      recycling_method: "Mechanical processing into non-woven mats and insulation batts",
      reuse_possibility: "High",
      secondary_applications: ["Industrial wiping rags", "Furniture cushioning filler", "Acoustic padding"]
    }
  }
};

// Add aliases to handle different casing or spelling of materials from predictions
export function getMaterialData(materialName) {
  if (!materialName) return MATERIAL_KNOWLEDGE_BASE["Blended Fabrics"];
  
  const formatted = materialName.trim().toLowerCase();
  
  if (formatted.includes("cotton")) return MATERIAL_KNOWLEDGE_BASE.Cotton;
  if (formatted.includes("polyester")) return MATERIAL_KNOWLEDGE_BASE.Polyester;
  if (formatted.includes("silk")) return MATERIAL_KNOWLEDGE_BASE.Silk;
  if (formatted.includes("wool")) return MATERIAL_KNOWLEDGE_BASE.Wool;
  if (formatted.includes("linen")) return MATERIAL_KNOWLEDGE_BASE.Linen;
  if (formatted.includes("rayon")) return MATERIAL_KNOWLEDGE_BASE.Rayon;
  if (formatted.includes("denim")) return MATERIAL_KNOWLEDGE_BASE.Denim;
  if (formatted.includes("nylon")) return MATERIAL_KNOWLEDGE_BASE.Nylon;
  if (formatted.includes("acrylic")) return MATERIAL_KNOWLEDGE_BASE.Acrylic;
  if (formatted.includes("hemp")) return MATERIAL_KNOWLEDGE_BASE.Hemp;
  if (formatted.includes("jute")) return MATERIAL_KNOWLEDGE_BASE.Jute;
  if (formatted.includes("bamboo")) return MATERIAL_KNOWLEDGE_BASE.Bamboo;
  if (formatted.includes("viscose")) return MATERIAL_KNOWLEDGE_BASE.Viscose;
  if (formatted.includes("spandex")) return MATERIAL_KNOWLEDGE_BASE.Spandex;
  if (formatted.includes("elastane") || formatted.includes("lycra")) return MATERIAL_KNOWLEDGE_BASE.Spandex;
  
  return MATERIAL_KNOWLEDGE_BASE["Blended Fabrics"];
}
