import pandas as pd
from typing import List, Dict, Any
from app.utils.recyclability import calculate_circularity_score

def aggregate_circularity(batches: List[Any]) -> Dict[str, Any]:
    """
    Aggregate circularity metrics over a list of batches using Pandas.
    """
    if not batches:
        return {
            "average_score": 0.0,
            "category_distribution": {},
            "fabric_type_breakdown": {},
            "source_breakdown": {},
            "time_trend": []
        }
    
    data = []
    for b in batches:
        qty = getattr(b, "quantity_kg", getattr(b, "quantity", 0.0))
        fabric_type = getattr(b, "fabric_type", "Blend")
        source = getattr(b, "source", "Post-consumer")
        # Format date safely
        date_obj = getattr(b, "collection_date", None)
        date_str = date_obj.isoformat() if date_obj else ""
        
        # Determine recyclability rate from TextileWaste records
        recyclability_rate = 0.70
        has_contaminants = False
        tw_list = getattr(b, "textile_wastes", [])
        if tw_list:
            recyclability_rate = tw_list[0].recyclability_rate
            has_contaminants = any(tw.has_contaminants for tw in tw_list)
            
        score, category, _ = calculate_circularity_score(
            recyclability_rate=recyclability_rate,
            condition=getattr(b, "condition", "Clean"),
            has_contaminants=has_contaminants
        )
        
        data.append({
            "id": getattr(b, "id", 0),
            "score": score,
            "category": category,
            "fabric_type": fabric_type,
            "source": source,
            "date": date_str,
            "quantity_kg": qty
        })
        
    df = pd.DataFrame(data)
    
    # 1. Average Circularity Score
    avg_score = float(df["score"].mean())
    
    # 2. Category Distribution
    cat_counts = df["category"].value_counts().to_dict()
    # Normalize distribution categories to make sure they are strings and have counts
    cat_dist = {str(k): int(v) for k, v in cat_counts.items()}
    
    # 3. Fabric Type Breakdown (Average score per fabric)
    fab_group = df.groupby("fabric_type")["score"].mean().to_dict()
    fabric_breakdown = {str(k): round(float(v), 2) for k, v in fab_group.items()}
    
    # 4. Source Breakdown (Average score per source)
    src_group = df.groupby("source")["score"].mean().to_dict()
    source_breakdown = {str(k): round(float(v), 2) for k, v in src_group.items()}
    
    # 5. Time Trend (Grouped by date, sorted chronologically)
    time_df = df.groupby("date")["score"].mean().reset_index()
    time_df = time_df.sort_values(by="date")
    time_trend = [
        {"label": str(row["date"]), "value": round(float(row["score"]), 2)}
        for _, row in time_df.iterrows() if row["date"]
    ]
    
    return {
        "average_score": round(avg_score, 2),
        "category_distribution": cat_dist,
        "fabric_type_breakdown": fabric_breakdown,
        "source_breakdown": source_breakdown,
        "time_trend": time_trend
    }

def material_flow_analysis(batches: List[Any]) -> Dict[str, float]:
    """
    Perform a material flow analysis (MFA) tracing inflows, recovery, diversion, and landfill mass.
    """
    if not batches:
        return {
            "inflow_kg": 0.0,
            "recovered_kg": 0.0,
            "diverted_kg": 0.0,
            "disposed_kg": 0.0
        }
        
    data = []
    for b in batches:
        qty = getattr(b, "quantity_kg", getattr(b, "quantity", 0.0))
        status = getattr(b, "status", "Collected").lower()
        data.append({
            "quantity_kg": qty,
            "status": status
        })
        
    df = pd.DataFrame(data)
    
    # Inflow: all items currently being sorted or collected
    inflow = float(df[df["status"].isin(["collected", "sorting"])]["quantity_kg"].sum())
    
    # Recovered: items in active recycling or processing
    recovered = float(df[df["status"].isin(["recycled", "processing"])]["quantity_kg"].sum())
    
    # Disposed: items that ended up in landfill/disposed
    disposed = float(df[df["status"] == "disposed"]["quantity_kg"].sum())
    
    # Diverted: total items kept out of landfill
    diverted = float(df[df["status"] != "disposed"]["quantity_kg"].sum())
    
    return {
        "inflow_kg": round(inflow, 2),
        "recovered_kg": round(recovered, 2),
        "diverted_kg": round(diverted, 2),
        "disposed_kg": round(disposed, 2)
    }
