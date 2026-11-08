
from datetime import date
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class SchemaBase(BaseModel):
    model_config = ConfigDict(extra="forbid")


class Sex(str, Enum):
    female = "F"
    male = "M"
    unknown = "no_especificado"


class FamilyMember(SchemaBase):
    first_names: str | None = None
    surnames: str | None = None
    document_number: str | None = None
    birth_date: date | None = None
    age_years: int | None = Field(default=None, ge=0, le=130)
    sex: Sex | None = Sex.unknown
    relationship: str | None = None
    marital_status: str | None = None
    education_level: str | None = None
    occupation_condition: str | None = None
    health_insurance: str | None = None


class HouseholdInfo(SchemaBase):
    province: str | None = None
    locality: str | None = None
    district: str | None = None
    sector: str | None = None
    residential_area: str | None = None
    address: str | None = None
    residence_time: str | None = None
    previous_residences: str | None = None
    travel_time_to_health_center: str | None = None
    usual_transport: str | None = None
    phone: str | None = None
    email: str | None = None


class FamilyVisit(SchemaBase):
    visit_date: date | None = None
    responsible_person: str | None = None
    result: str | None = None
    next_visit_date: date | None = None


class FamilyRecord(SchemaBase):
    family_number: str | None = None
    health_network: str | None = None
    health_establishment: str | None = None
    informants: list[str] = Field(default_factory=list)

    household: HouseholdInfo = Field(default_factory=HouseholdInfo)
    members: list[FamilyMember] = Field(default_factory=list)
    visits: list[FamilyVisit] = Field(default_factory=list)
