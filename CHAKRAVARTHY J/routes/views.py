"""
Serves the frontend HTML pages. Auth/role enforcement for actual data
happens via the JWT-protected API; these routes just serve static
shells that the JS then populates via fetch() calls.
"""

from flask import Blueprint, render_template

views_bp = Blueprint("views", __name__)


@views_bp.route("/")
def index():
    return render_template("login.html")


@views_bp.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")


@views_bp.route("/inventory")
def inventory_page():
    return render_template("inventory.html")


@views_bp.route("/dataset")
def dataset_page():
    return render_template("dataset.html")


@views_bp.route("/analysis")
def analysis_page():
    return render_template("analysis.html")


@views_bp.route("/sustainability")
def sustainability_page():
    return render_template("sustainability.html")


@views_bp.route("/analytics")
def analytics_page():
    return render_template("analytics.html")


@views_bp.route("/reports")
def reports_page():
    return render_template("reports.html")
