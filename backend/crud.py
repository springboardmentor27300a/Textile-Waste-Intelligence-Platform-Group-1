from sqlalchemy.orm import Session
from datetime import datetime
import models
from security import hash_password

# ---------------- User ---------------- #

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def create_user(db: Session, name: str, email: str, password: str):

    user = models.User(
        name=name,
        email=email,
        password=hash_password(password),
        role="User"
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


# ---------------- Inventory ---------------- #

def get_inventory(db: Session):
    return db.query(models.Inventory).all()


def add_inventory(db: Session, fabric: str, weight: str):

    item = models.Inventory(
        fabric=fabric,
        weight=weight,
        status="Available"
    )

    db.add(item)
    db.commit()
    db.refresh(item)

    return item


# ---------------- Dataset ---------------- #

def get_datasets(db: Session):
    return db.query(models.Dataset).all()


def add_dataset(db: Session, filename: str, fabric_type: str):

    dataset = models.Dataset(
        filename=filename,
        fabric_type=fabric_type,
        status="Uploaded"
    )

    db.add(dataset)
    db.commit()
    db.refresh(dataset)

    return dataset


# ---------------- Prediction History ---------------- #

def add_prediction_history(db: Session, prediction: dict):

    item = models.PredictionHistory(
        fabric=prediction["fabric"],
        confidence=str(prediction["confidence"]),

        category=prediction["category"],
        recyclability=prediction["recyclability"],
        recommendation=prediction["recommendation"],

        fiber_composition=prediction["fiber_composition"],
        material_quality=prediction["material_quality"],

        texture=prediction["texture"],
        pattern=prediction["pattern"],
        color_type=prediction["color_type"],

        damage=prediction["damage"],
        contamination=prediction["contamination"],

        reuse_potential=prediction["reuse_potential"],
        disposal=prediction["disposal"],

        recycling_method=prediction["recycling_method"],

        environmental_impact=prediction["environmental_impact"],

        co2_saving=prediction["co2_saving"],
        water_saving=prediction["water_saving"],

        circular_score=prediction["circular_score"],

        created_at=datetime.now().strftime("%d-%m-%Y %H:%M:%S")
    )

    db.add(item)
    db.commit()
    db.refresh(item)

    return item


def get_prediction_history(db: Session):

    return (
        db.query(models.PredictionHistory)
        .order_by(models.PredictionHistory.id.desc())
        .all()
    )


# ---------------- Dashboard ---------------- #

def get_dashboard_stats(db: Session):

    total_predictions = db.query(models.PredictionHistory).count()

    high_recycle = (
        db.query(models.PredictionHistory)
        .filter(models.PredictionHistory.recyclability == "High")
        .count()
    )

    low_impact = (
        db.query(models.PredictionHistory)
        .filter(models.PredictionHistory.environmental_impact == "Low")
        .count()
    )

    avg_score = 0
    sustainability_grade = "N/A"

    scores = db.query(models.PredictionHistory.circular_score).all()

    if scores:

        values = []

        for score in scores:
            try:
                values.append(
                    float(
                        str(score.circular_score).replace("%", "")
                    )
                )
            except:
                pass

        if values:
            avg_score = round(sum(values) / len(values), 2)
            if avg_score >= 90:
                sustainability_grade = "A+"

            elif avg_score >= 80:
                sustainability_grade = "A"

            elif avg_score >= 70:
                sustainability_grade = "B"

            elif avg_score >= 60:
                sustainability_grade = "C"

            else:
                sustainability_grade = "D"
    
    return {

        "users": db.query(models.User).count(),

        "inventory": db.query(models.Inventory).count(),

        "datasets": db.query(models.Dataset).count(),

        "predictions": total_predictions,

        "high_recyclable": high_recycle,

        "low_impact": low_impact,

        "average_circular_score": avg_score,

        "sustainability_grade": sustainability_grade,

    }

def get_sustainability_dashboard(db: Session):

    predictions = db.query(models.PredictionHistory).all()

    if len(predictions) == 0:

        return {
            "total_predictions": 0,
            "average_confidence": 0,
            "average_circular_score": 0,
            "total_co2_saved": 0,
            "total_water_saved": 0,
            "high_recyclable": 0,
            "low_impact": 0
        }

    total_predictions = len(predictions)

    avg_confidence = sum(
        float(p.confidence)
        for p in predictions
    ) / total_predictions

    avg_circular = sum(
        float(str(p.circular_score).replace("%", ""))
        for p in predictions
    ) / total_predictions

    total_co2 = sum(
        float(str(p.co2_saving).replace("kg", "").strip())
        for p in predictions
    )

    total_water = sum(
        float(str(p.water_saving).replace("L", "").strip())
        for p in predictions
    )

    high_recyclable = sum(
        1 for p in predictions
        if p.recyclability == "High"
    )

    low_impact = sum(
        1 for p in predictions
        if p.environmental_impact == "Low"
    )

    return {

        "total_predictions": total_predictions,

        "average_confidence": round(avg_confidence,2),

        "average_circular_score": round(avg_circular,2),

        "total_co2_saved": round(total_co2,2),

        "total_water_saved": round(total_water,2),

        "high_recyclable": high_recyclable,

        "low_impact": low_impact

    }