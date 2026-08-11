from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional

app = FastAPI(title="AdmitBridge ML Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class StudentAcademics(BaseModel):
    greScore: Optional[float] = None
    toeflScore: Optional[float] = None
    ieltsScore: Optional[float] = None
    cgpa: Optional[float] = None
    researchExperience: Optional[float] = 0
    workExperience: Optional[float] = 0
    intendedMajor: Optional[str] = None
    targetTerm: Optional[str] = None
    preferredCountry: Optional[str] = None
    budget: Optional[float] = None


class UniversityInput(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(default=None, alias="_id")
    name: str
    country: Optional[str] = None
    worldRank: Optional[float] = None
    avgGre: Optional[float] = None
    avgToefl: Optional[float] = None
    ieltsRequirement: Optional[float] = None
    avgCgpa: Optional[float] = None
    acceptanceRate: Optional[float] = None
    tuitionFee: Optional[float] = None
    programs: List[str] = []


class PredictRequest(BaseModel):
    student: StudentAcademics
    universities: List[UniversityInput] = []


@app.get("/health")
def health():
    return {"status": "ok", "service": "admitbridge-ml"}


def _clamp(value, low, high):
    return max(low, min(high, value))


def _score_university(student: StudentAcademics, uni: UniversityInput):
    """Rule-based match score. Returns (probability, reasons)."""
    reasons = []

    # Start from the university's own generosity (acceptance rate), dampened so
    # it doesn't dominate the score.
    base = 15 + (uni.acceptanceRate if uni.acceptanceRate is not None else 50) * 0.4

    # GRE fit
    if student.greScore is not None and uni.avgGre is not None:
        gap = student.greScore - uni.avgGre
        base += gap * 2.0
        if gap >= 0:
            reasons.append(f"GRE {student.greScore:.0f} meets or exceeds the typical {uni.avgGre:.0f}")
        else:
            reasons.append(f"GRE {student.greScore:.0f} is below the typical {uni.avgGre:.0f}")

    # TOEFL fit (or IELTS, whichever the student provided)
    if student.toeflScore is not None and uni.avgToefl is not None:
        gap = student.toeflScore - uni.avgToefl
        base += gap * 0.8
        if gap >= 0:
            reasons.append(f"TOEFL {student.toeflScore:.0f} clears the typical {uni.avgToefl:.0f}")
        else:
            reasons.append(f"TOEFL {student.toeflScore:.0f} is below the typical {uni.avgToefl:.0f}")
    elif student.ieltsScore is not None and uni.ieltsRequirement is not None:
        gap = student.ieltsScore - uni.ieltsRequirement
        base += gap * 6.0
        if gap >= 0:
            reasons.append(f"IELTS {student.ieltsScore:.1f} meets the required {uni.ieltsRequirement:.1f}")
        else:
            reasons.append(f"IELTS {student.ieltsScore:.1f} is below the required {uni.ieltsRequirement:.1f}")

    # CGPA fit (10-point scale)
    if student.cgpa is not None and uni.avgCgpa is not None:
        gap = student.cgpa - uni.avgCgpa
        base += gap * 12.0
        if gap >= 0:
            reasons.append(f"CGPA {student.cgpa:.1f} exceeds the typical {uni.avgCgpa:.1f}")
        else:
            reasons.append(f"CGPA {student.cgpa:.1f} is below the typical {uni.avgCgpa:.1f}")

    # Research / work experience
    research = student.researchExperience or 0
    work = student.workExperience or 0
    if research >= 12:
        base += 4
        reasons.append("Over a year of research experience")
    elif research > 0:
        base += 2
    if work >= 24:
        base += 3
        reasons.append("Two or more years of work experience")

    # Program match
    if student.intendedMajor and uni.programs:
        wanted = student.intendedMajor.strip().lower()
        if any(wanted in p.lower() or p.lower() in wanted for p in uni.programs):
            base += 6
            reasons.append(f"Offers {student.intendedMajor}")

    # Preferred country
    if student.preferredCountry and uni.country:
        pref = student.preferredCountry.strip().lower()
        if pref in uni.country.lower() or uni.country.lower() in pref:
            base += 8
            reasons.append(f"Located in your preferred country ({uni.country})")
        else:
            base -= 12
            reasons.append(f"Not in your preferred country ({uni.country})")

    # Budget fit
    if student.budget is not None and uni.tuitionFee is not None:
        if uni.tuitionFee <= student.budget:
            base += 4
            reasons.append(f"Tuition ${uni.tuitionFee:,.0f}/yr fits your budget")
        else:
            base -= 14
            reasons.append(f"Tuition ${uni.tuitionFee:,.0f}/yr exceeds your budget")

    # Prestige penalty: top-ranked schools are harder to get into
    if uni.worldRank is not None:
        base -= max(0, 10 - uni.worldRank) * 0.4

    probability = int(round(_clamp(base, 5, 95)))

    if not reasons:
        reasons.append("Profile fits typical admitted-student ranges")

    if probability >= 70:
        category = "Safe"
    elif probability >= 40:
        category = "Target"
    else:
        category = "Ambitious"

    return {
        "universityId": uni.id,
        "name": uni.name,
        "probabilityScore": probability,
        "category": category,
        "reason": "; ".join(reasons),
    }


@app.post("/predict")
def predict(req: PredictRequest):
    results = [_score_university(req.student, uni) for uni in req.universities]
    results.sort(key=lambda r: r["probabilityScore"], reverse=True)
    return {"results": results}
