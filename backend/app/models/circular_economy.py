"""
Circular Economy Analytics Model — Milestone 3 (Circular Economy Analytics Engine)

Stores metadata for each generated circular economy analytics snapshot.

Table: circular_economy_analytics

Design decisions
----------------
- Only METADATA is persisted here (id, generated_at, total_items, overall_rating,
  summary, generated_insights).
- All numerical KPIs (CO₂, water, landfill, etc.) are ALWAYS computed on-the-fly
  from sustainability_metrics, recycling_recommendations, environmental_reports,
  and inventory — consistent with the no-duplication mandate.
- generated_insights is stored as JSON-encoded text (list of strings), deserialised
  by the service/schema layer before serving to clients.
"""

from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func

from app.database import Base


class CircularEconomyAnalytics(Base):
    """
    Persists a single analytics generation event.

    Each row represents one call to the analytics generation endpoint.
    The row captures the overall rating, a narrative summary, and the list
    of dynamically generated insights at the moment of generation.

    All aggregate statistics (totals, distributions, averages) are
    re-computed at retrieval time from the live source tables.
    """

    __tablename__ = "circular_economy_analytics"

    # ── Primary Key ───────────────────────────────────────────────────────────
    id = Column(Integer, primary_key=True, index=True)

    # ── Snapshot Metadata ─────────────────────────────────────────────────────
    generated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True,
    )
    """UTC timestamp of when this analytics snapshot was generated."""

    total_items = Column(Integer, nullable=False, default=0)
    """Number of inventory items included in this snapshot."""

    # ── Overall Rating ────────────────────────────────────────────────────────
    overall_rating = Column(String, nullable=False, default="")
    """
    Platform-level circular economy performance rating.
    Values: 'Excellent Circular Economy Performance'
            'Good Circular Economy Performance'
            'Average Circular Economy Performance'
            'Needs Improvement'
    """

    # ── Narrative ─────────────────────────────────────────────────────────────
    summary = Column(Text, nullable=False, default="")
    """One-paragraph human-readable summary of the platform's circular economy status."""

    generated_insights = Column(Text, nullable=False, default="[]")
    """
    JSON-encoded list of 5–10 dynamic insight strings generated from live data.
    Deserialised by the service/schema layer before serving to clients.
    Example: '["Cotton contributes the highest carbon savings.", ...]'
    """
