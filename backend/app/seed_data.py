"""Seeds demo accounts, sample inventory, and dataset registry. Run with: python -m app.seed_data"""
import datetime as dt
from .database import Base, engine, SessionLocal
from . import models
from .security import hash_password

Base.metadata.create_all(bind=engine)

DEMO_USERS = [
    dict(full_name="Asha Rao", email="admin@textilewaste.io", organization="Platform Administration",
         password="Admin@12345", role=models.UserRole.ADMIN),
    dict(full_name="Karthik Iyer", email="operator@textilewaste.io", organization="Bengaluru Sorting & Recovery Unit",
         password="Operator@12345", role=models.UserRole.RECYCLING_OPERATOR),
    dict(full_name="Meera Nair", email="sustainability@textilewaste.io", organization="Sustainability & ESG Office",
         password="Sustain@12345", role=models.UserRole.SUSTAINABILITY_MANAGER),
    dict(full_name="Rohit Shetty", email="manufacturer@textilewaste.io", organization="Shetty Textile Mills",
         password="Manuf@12345", role=models.UserRole.MANUFACTURER),
]

SAMPLE_BATCHES = [
    dict(fabric_type=models.FabricType.COTTON, source="Bengaluru Sorting Unit 3", source_type="post_consumer",
         quantity_kg=182.5, color="Indigo", condition=models.WasteCondition.WORN,
         collection_date=dt.date(2026, 6, 2), category=models.WasteCategory.RECYCLABLE,
         status=models.BatchStatus.CLASSIFIED, notes="Denim jeans, mixed sizes, post-consumer donation reject."),
    dict(fabric_type=models.FabricType.DENIM, source="Peenya Industrial Area - Cutting Waste", source_type="manufacturing_waste",
         quantity_kg=340.0, color="Blue", condition=models.WasteCondition.NEW_SURPLUS,
         collection_date=dt.date(2026, 6, 5), category=models.WasteCategory.RECYCLABLE,
         status=models.BatchStatus.ROUTED, notes="Fabric cutting room offcuts, clean and unused."),
    dict(fabric_type=models.FabricType.POLYESTER, source="HSR Layout Municipal Collection", source_type="post_consumer",
         quantity_kg=96.2, color="Assorted", condition=models.WasteCondition.DAMAGED,
         collection_date=dt.date(2026, 6, 8), category=models.WasteCategory.UPCYCLABLE,
         status=models.BatchStatus.IN_ANALYSIS, notes="Sportswear, torn seams, printable panels intact."),
    dict(fabric_type=models.FabricType.WOOL, source="Whitefield Donation Drive", source_type="post_consumer",
         quantity_kg=54.0, color="Grey", condition=models.WasteCondition.LIGHTLY_WORN,
         collection_date=dt.date(2026, 6, 10), category=models.WasteCategory.REUSABLE,
         status=models.BatchStatus.CLASSIFIED, notes="Winter sweaters, good condition, resale candidates."),
    dict(fabric_type=models.FabricType.SILK, source="Shetty Textile Mills - Sample Room", source_type="manufacturing_waste",
         quantity_kg=12.4, color="Ivory", condition=models.WasteCondition.NEW_SURPLUS,
         collection_date=dt.date(2026, 6, 11), category=models.WasteCategory.UNCLASSIFIED,
         status=models.BatchStatus.REGISTERED, notes="Sari sample swatches, awaiting classification."),
    dict(fabric_type=models.FabricType.NYLON, source="Electronic City Corporate Uniform Return", source_type="post_consumer",
         quantity_kg=71.8, color="Navy", condition=models.WasteCondition.WORN,
         collection_date=dt.date(2026, 6, 12), category=models.WasteCategory.RECYCLABLE,
         status=models.BatchStatus.CLASSIFIED, notes="Retired security uniforms, zippers need removal."),
    dict(fabric_type=models.FabricType.MIXED, source="Jayanagar Community Bin", source_type="post_consumer",
         quantity_kg=205.0, color="Assorted", condition=models.WasteCondition.CONTAMINATED,
         collection_date=dt.date(2026, 6, 14), category=models.WasteCategory.HAZARDOUS,
         status=models.BatchStatus.CLASSIFIED, notes="Mixed household textiles, oil staining detected on intake."),
    dict(fabric_type=models.FabricType.LINEN, source="Shetty Textile Mills - Cutting Floor", source_type="manufacturing_waste",
         quantity_kg=38.6, color="Natural", condition=models.WasteCondition.NEW_SURPLUS,
         collection_date=dt.date(2026, 6, 15), category=models.WasteCategory.UPCYCLABLE,
         status=models.BatchStatus.ROUTED, notes="Clean linen offcuts suitable for accessory upcycling."),
    dict(fabric_type=models.FabricType.RAYON, source="Koramangala Retail Take-Back", source_type="post_consumer",
         quantity_kg=63.3, color="Maroon", condition=models.WasteCondition.LIGHTLY_WORN,
         collection_date=dt.date(2026, 6, 17), category=models.WasteCategory.REUSABLE,
         status=models.BatchStatus.IN_ANALYSIS, notes="In-store take-back scheme, garments in wearable condition."),
    dict(fabric_type=models.FabricType.ACRYLIC, source="Yeshwanthpur Sorting Unit", source_type="post_consumer",
         quantity_kg=118.9, color="Multicolour", condition=models.WasteCondition.WORN,
         collection_date=dt.date(2026, 6, 19), category=models.WasteCategory.RECYCLABLE,
         status=models.BatchStatus.REGISTERED, notes="Blankets and throws, low contamination."),
    dict(fabric_type=models.FabricType.COTTON, source="Indiranagar Household Collection Drive", source_type="post_consumer",
         quantity_kg=142.0, color="White", condition=models.WasteCondition.DAMAGED,
         collection_date=dt.date(2026, 6, 21), category=models.WasteCategory.COMPOSTABLE,
         status=models.BatchStatus.CLASSIFIED, notes="Undyed cotton, heavily worn, unsuitable for reuse."),
    dict(fabric_type=models.FabricType.POLYESTER, source="Shetty Textile Mills - QC Rejects", source_type="manufacturing_waste",
         quantity_kg=88.4, color="Black", condition=models.WasteCondition.NEW_SURPLUS,
         collection_date=dt.date(2026, 6, 23), category=models.WasteCategory.RECYCLABLE,
         status=models.BatchStatus.PROCESSED, notes="Quality-control rejected fabric rolls, dye lot mismatch."),
]

DATASETS = [
    dict(name="TIPS - Textile Image Dataset (proxy: TextileNet material taxonomy)", slug="tips-textile-image-dataset",
         purpose="Fabric classification and textile recognition baseline.", source_url="https://arxiv.org/abs/2301.06160",
         license="Research use - check publisher terms",
         notes="No single canonical public release is named 'TIPS'; TextileNet is the closest openly documented fibre/fabric taxonomy dataset."),
    dict(name="DeepFashion", slug="deepfashion", purpose="Garment recognition and fabric category classification.",
         source_url="http://mmlab.ie.cuhk.edu.hk/projects/DeepFashion.html", license="Non-commercial research use (CUHK Multimedia Lab)"),
    dict(name="Fashion-MNIST", slug="fashion-mnist", purpose="Clothing classification baseline for image pipeline smoke tests.",
         source_url="https://github.com/zalandoresearch/fashion-mnist", license="MIT"),
    dict(name="Fabric Image Dataset (Kaggle)", slug="fabric-image-dataset-kaggle", purpose="Fabric texture recognition and material/defect classification.",
         source_url="https://www.kaggle.com/datasets/priemshpathirana/fabric-stain-dataset", license="Kaggle dataset terms - verify before commercial use"),
    dict(name="Sustainable Fashion Dataset (Kaggle)", slug="sustainable-fashion-dataset-kaggle", purpose="Waste categorisation context and recycling recommendation support.",
         source_url="https://www.kaggle.com/datasets/waqi786/sustainable-fashion-eco-friendly-trends", license="Kaggle dataset terms - verify before commercial use"),
]


SAMPLE_NOTIFICATIONS = [
    dict(title="New Denim Batch Registered", message="Batch WB-2026-000002 (340kg Denim offcuts) ready for processing.", type=models.NotificationType.COLLECTION_ALERT),
    dict(title="Recycling Partnership Matched", message="High-purity cotton batch WB-2026-000001 qualified for Mechanical Fiber Recycling.", type=models.NotificationType.RECYCLING_OPPORTUNITY),
    dict(title="Sustainability Target Milestone", message="Platform diverted over 1,200 kg of textile waste from landfills this month!", type=models.NotificationType.SUSTAINABILITY_MILESTONE),
    dict(title="Contamination Inspection Alert", message="Batch WB-2026-000007 flagged for oil contamination during intake.", type=models.NotificationType.INVENTORY_WARNING),
    dict(title="System Announcement", message="Reloom Platform v0.3.0 updated with enhanced AI Twill Weave Denim Recognition.", type=models.NotificationType.ANNOUNCEMENT),
]


def run():
    db = SessionLocal()
    try:
        users_by_email = {}
        for u in DEMO_USERS:
            existing = db.query(models.User).filter(models.User.email == u["email"]).first()
            if existing:
                users_by_email[u["email"]] = existing
                continue
            user = models.User(full_name=u["full_name"], email=u["email"], organization=u["organization"],
                                hashed_password=hash_password(u["password"]), role=u["role"])
            db.add(user); db.flush()
            users_by_email[u["email"]] = user
        db.commit()

        if db.query(models.WasteBatch).count() == 0:
            operator = users_by_email["operator@textilewaste.io"]
            manufacturer = users_by_email["manufacturer@textilewaste.io"]
            for i, b in enumerate(SAMPLE_BATCHES):
                year = b["collection_date"].year
                owner = manufacturer if b["source_type"] == "manufacturing_waste" else operator
                db.add(models.WasteBatch(batch_code=f"WB-{year}-{i+1:06d}", registered_by=owner.id, **b))
            db.commit()

        for d in DATASETS:
            if db.query(models.Dataset).filter(models.Dataset.slug == d["slug"]).first():
                continue
            db.add(models.Dataset(status=models.DatasetStatus.REGISTERED, **d))
        db.commit()

        if db.query(models.Notification).count() == 0:
            for n in SAMPLE_NOTIFICATIONS:
                db.add(models.Notification(**n))
            db.commit()

        print("Seed complete.")
        print("Demo accounts (for local development / grading only - do not use in production):")
        for u in DEMO_USERS:
            print(f"  {u['role'].value:30s} {u['email']:32s} {u['password']}")
    finally:
        db.close()


if __name__ == "__main__":
    run()

