"""
Textile Waste Intelligence Platform - Backend
Milestone 1: Project Initialization, Design Process & Core Setup
Milestone 2: Material Recognition & Waste Classification
Milestone 3: Sustainability Intelligence & Recommendations
Milestone 4: Analytics, Testing & Deployment

App factory pattern: creates and configures the Flask app, initializes
extensions (SQLAlchemy, CORS), registers blueprints, and seeds the
database with an initial admin user + sample inventory on first run.
"""

import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

db = SQLAlchemy()

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))


def create_app(test_config: dict | None = None):
    """App factory.

    test_config: optional dict of Flask config overrides, used by the
    Milestone 4 pytest suite to point the app at an in-memory SQLite
    database instead of the real instance/textile_waste.db file, and to
    skip demo-data seeding where it isn't needed.
    """
    app = Flask(
        __name__,
        template_folder=os.path.join(BASE_DIR, "frontend", "templates"),
        static_folder=os.path.join(BASE_DIR, "frontend", "static"),
    )

    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-change-in-production")
    app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "dev-jwt-secret-change-in-production")
    app.config["JWT_EXPIRY_HOURS"] = 8

    instance_dir = os.path.join(BASE_DIR, "backend", "instance")
    os.makedirs(instance_dir, exist_ok=True)
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
        "DATABASE_URL", "sqlite:///" + os.path.join(instance_dir, "textile_waste.db")
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    app.config["DATASET_DIR"] = os.path.join(BASE_DIR, "backend", "data")
    app.config["SEED_DEMO_DATA"] = True
    app.config["TESTING"] = False

    if test_config:
        app.config.update(test_config)

    db.init_app(app)
    CORS(app, supports_credentials=True)

    from app.routes.auth_routes import auth_bp
    from app.routes.inventory_routes import inventory_bp
    from app.routes.dataset_routes import dataset_bp
    from app.routes.analysis_routes import analysis_bp
    from app.routes.sustainability_routes import sustainability_bp
    from app.routes.analytics_routes import analytics_bp
    from app.routes.reports_routes import reports_bp
    from app.routes.notifications_routes import notifications_bp
    from app.routes.views import views_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(inventory_bp, url_prefix="/api/inventory")
    app.register_blueprint(dataset_bp, url_prefix="/api/dataset")
    app.register_blueprint(analysis_bp, url_prefix="/api/analysis")
    app.register_blueprint(sustainability_bp, url_prefix="/api/sustainability")
    app.register_blueprint(analytics_bp, url_prefix="/api/analytics")
    app.register_blueprint(reports_bp, url_prefix="/api/reports")
    app.register_blueprint(notifications_bp, url_prefix="/api/notifications")
    app.register_blueprint(views_bp)

    @app.route("/api/health")
    def health_check():
        """Milestone 4: liveness/readiness probe for Docker/cloud deployment."""
        return {"status": "ok", "service": "textile-waste-intelligence-platform"}, 200

    with app.app_context():
        from app.models.user import User
        from app.models.inventory import InventoryItem
        from app.models.analysis import AnalysisResult
        from app.models.sustainability import SustainabilityAssessment
        from app.utils.security import hash_password

        db.create_all()

        if not app.config.get("SEED_DEMO_DATA", True):
            return app

        # Seed a default admin + staff account on first run so the
        # role-based access system is testable immediately.
        if User.query.count() == 0:
            admin = User(
                username="admin",
                email="admin@textilewaste.local",
                password_hash=hash_password("Admin@123"),
                role="admin",
            )
            staff = User(
                username="staff1",
                email="staff1@textilewaste.local",
                password_hash=hash_password("Staff@123"),
                role="staff",
            )
            db.session.add_all([admin, staff])
            db.session.commit()

        if InventoryItem.query.count() == 0:
            sample_items = [
                InventoryItem(
                    item_name="Cotton Offcuts - Batch A",
                    fabric_type="Cotton",
                    waste_category="Pre-consumer",
                    quantity_kg=120.5,
                    condition="Reusable",
                    source_location="Bengaluru Unit 1",
                    recycling_status="Pending",
                ),
                InventoryItem(
                    item_name="Polyester Blend Scraps",
                    fabric_type="Polyester",
                    waste_category="Post-consumer",
                    quantity_kg=85.0,
                    condition="Degraded",
                    source_location="Bengaluru Unit 2",
                    recycling_status="In Process",
                ),
                InventoryItem(
                    item_name="Denim Trimmings",
                    fabric_type="Denim",
                    waste_category="Pre-consumer",
                    quantity_kg=42.75,
                    condition="Reusable",
                    source_location="Doddaballapura Facility",
                    recycling_status="Recycled",
                ),
            ]
            db.session.add_all(sample_items)
            db.session.commit()

    return app
