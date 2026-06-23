from __future__ import annotations

import csv
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal
from uuid import uuid4

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
CSV_PATH = DATA_DIR / "affiliates.csv"
REFERRAL_BASE_URL = "https://mindzlabz.com"

PARTNER_TYPE_CODES = {
    "Affiliate Partner": "AFF",
    "Referral Partner": "REF",
    "Influencer / Content Creator": "INF",
    "Freelancer / Designer": "FRL",
    "Digital Marketer": "DGM",
    "Existing Customer": "CUS",
    "Business Consultant": "CON",
    "Other": "OTH",
}

CSV_FIELDS = [
    "id",
    "affiliate_id",
    "referral_code",
    "referral_link",
    "name",
    "whatsapp",
    "email",
    "partner_type",
    "social_media",
    "notes",
    "status",
    "created_at",
    "updated_at",
]


class AffiliateBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    whatsapp: str = Field(..., min_length=6, max_length=40)
    email: EmailStr | None = None
    partner_type: str = Field(default="Affiliate Partner", max_length=80)
    social_media: str | None = Field(default=None, max_length=300)
    notes: str | None = Field(default=None, max_length=1500)


class AffiliateCreate(AffiliateBase):
    pass


class AffiliateUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    whatsapp: str | None = Field(default=None, min_length=6, max_length=40)
    email: EmailStr | None = None
    partner_type: str | None = Field(default=None, max_length=80)
    social_media: str | None = Field(default=None, max_length=300)
    notes: str | None = Field(default=None, max_length=1500)
    status: Literal["new", "contacted", "approved", "rejected", "archived"] | None = None


class Affiliate(AffiliateBase):
    id: str
    affiliate_id: str
    referral_code: str
    referral_link: str
    status: str
    created_at: str
    updated_at: str


app = FastAPI(
    title="HDS Consultancy Affiliate API",
    version="1.0.0",
    description="CSV-backed CRUD API for HDS Consultancy affiliate registrations.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8012",
        "http://127.0.0.1:8012",
        "http://localhost:8013",
        "http://127.0.0.1:8013",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def ensure_csv() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if CSV_PATH.exists():
        return
    with CSV_PATH.open("w", newline="", encoding="utf-8") as file:
        csv.DictWriter(file, fieldnames=CSV_FIELDS).writeheader()


def read_rows() -> list[dict[str, str]]:
    ensure_csv()
    with CSV_PATH.open(newline="", encoding="utf-8") as file:
        return list(csv.DictReader(file))


def write_rows(rows: list[dict[str, str]]) -> None:
    ensure_csv()
    with CSV_PATH.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=CSV_FIELDS)
        writer.writeheader()
        writer.writerows(rows)


def partner_code(partner_type: str) -> str:
    return PARTNER_TYPE_CODES.get(partner_type, "OTH")


def next_affiliate_id(partner_type: str, rows: list[dict[str, str]]) -> str:
    code = partner_code(partner_type)
    prefix = f"HDS-{code}-"
    highest = 0
    for row in rows:
        affiliate_id = row.get("affiliate_id", "")
        if affiliate_id.startswith(prefix):
            try:
                highest = max(highest, int(affiliate_id.rsplit("-", 1)[-1]))
            except ValueError:
                continue
    return f"{prefix}{highest + 1:04d}"


def referral_from_affiliate_id(affiliate_id: str) -> tuple[str, str]:
    referral_code = affiliate_id.replace("-", "")
    return referral_code, f"{REFERRAL_BASE_URL}/?ref={referral_code}"


def normalize_row(row: dict[str, str]) -> Affiliate:
    return Affiliate(
        id=row["id"],
        affiliate_id=row["affiliate_id"],
        referral_code=row["referral_code"],
        referral_link=row["referral_link"],
        name=row["name"],
        whatsapp=row["whatsapp"],
        email=row.get("email") or None,
        partner_type=row["partner_type"],
        social_media=row.get("social_media") or None,
        notes=row.get("notes") or None,
        status=row["status"],
        created_at=row["created_at"],
        updated_at=row["updated_at"],
    )


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/affiliates", response_model=Affiliate, status_code=201)
def create_affiliate(payload: AffiliateCreate) -> Affiliate:
    rows = read_rows()
    affiliate_id = next_affiliate_id(payload.partner_type, rows)
    referral_code, referral_link = referral_from_affiliate_id(affiliate_id)
    timestamp = now_iso()
    row = {
        "id": str(uuid4()),
        "affiliate_id": affiliate_id,
        "referral_code": referral_code,
        "referral_link": referral_link,
        "name": payload.name.strip(),
        "whatsapp": payload.whatsapp.strip(),
        "email": str(payload.email or ""),
        "partner_type": payload.partner_type,
        "social_media": payload.social_media or "",
        "notes": payload.notes or "",
        "status": "new",
        "created_at": timestamp,
        "updated_at": timestamp,
    }
    rows.append(row)
    write_rows(rows)
    return normalize_row(row)


@app.get("/api/affiliates", response_model=list[Affiliate])
def list_affiliates(
    partner_type: str | None = None,
    status: str | None = None,
    limit: int = Query(default=100, ge=1, le=500),
) -> list[Affiliate]:
    rows = read_rows()
    if partner_type:
        rows = [row for row in rows if row.get("partner_type") == partner_type]
    if status:
        rows = [row for row in rows if row.get("status") == status]
    return [normalize_row(row) for row in rows[:limit]]


@app.get("/api/affiliates/{affiliate_id}", response_model=Affiliate)
def get_affiliate(affiliate_id: str) -> Affiliate:
    for row in read_rows():
        if row["id"] == affiliate_id or row["affiliate_id"] == affiliate_id:
            return normalize_row(row)
    raise HTTPException(status_code=404, detail="Affiliate not found")


@app.patch("/api/affiliates/{affiliate_id}", response_model=Affiliate)
def update_affiliate(affiliate_id: str, payload: AffiliateUpdate) -> Affiliate:
    rows = read_rows()
    updates = payload.model_dump(exclude_unset=True)
    for index, row in enumerate(rows):
        if row["id"] != affiliate_id and row["affiliate_id"] != affiliate_id:
            continue
        if "partner_type" in updates and updates["partner_type"] != row["partner_type"]:
            row["partner_type"] = updates["partner_type"] or row["partner_type"]
            row["affiliate_id"] = next_affiliate_id(row["partner_type"], rows)
            row["referral_code"], row["referral_link"] = referral_from_affiliate_id(row["affiliate_id"])
        for key, value in updates.items():
            csv_key = "social_media" if key == "social_media" else key
            if key == "partner_type":
                continue
            row[csv_key] = str(value or "")
        row["updated_at"] = now_iso()
        rows[index] = row
        write_rows(rows)
        return normalize_row(row)
    raise HTTPException(status_code=404, detail="Affiliate not found")


@app.delete("/api/affiliates/{affiliate_id}")
def delete_affiliate(affiliate_id: str) -> dict[str, str]:
    rows = read_rows()
    kept = [row for row in rows if row["id"] != affiliate_id and row["affiliate_id"] != affiliate_id]
    if len(kept) == len(rows):
      raise HTTPException(status_code=404, detail="Affiliate not found")
    write_rows(kept)
    return {"status": "deleted", "affiliate_id": affiliate_id}
