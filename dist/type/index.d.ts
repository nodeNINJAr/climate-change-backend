import { Document, Types } from 'mongoose';
export declare enum Division {
    DHAKA = "Dhaka",
    CHATTOGRAM = "Chattogram",
    RAJSHAHI = "Rajshahi",
    KHULNA = "Khulna",
    BARISAL = "Barisal",
    SYLHET = "Sylhet",
    RANGPUR = "Rangpur",
    MYMENSINGH = "Mymensingh"
}
export declare enum DamageLevel {
    SEVERELY_DAMAGE = "Severely Damage",
    MODERATELY_DAMAGE = "Moderately Damage",
    SLIGHTLY_DAMAGE = "Slightly Damage",
    NO_DAMAGE = "No Damage"
}
export interface IConfig extends Document {
    name: DamageLevel;
    value: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface IEntry extends Document {
    division: Division;
    climateHazardCategory: string;
    createdDate: Date;
    updatedDate: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface ICriteria extends Document {
    entryId: Types.ObjectId;
    criteriaTitle: string;
    weight: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface ICriteriaResult {
    criteriaId: Types.ObjectId;
    criteriaTitle: string;
    selectedConfig: string;
    configValue: number;
}
export interface ICalculationResult extends Document {
    division: string;
    entryId: Types.ObjectId;
    criteriaResults: ICriteriaResult[];
    totalScore: number;
    averageScore: number;
    riskLevel: string;
    pdfUrl?: string;
    calculatedDate: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface ICriteriaSelection {
    criteriaId: string;
    value: number;
}
export interface ICalculationRequest {
    entryId: string;
    criteriaSelections: ICriteriaSelection[];
}
export interface ICalculationResponse {
    division: string;
    entryId: Types.ObjectId;
    climateHazardCategory: string;
    criteriaResults: ICriteriaResult[];
    totalScore: number;
    averageScore: number;
    riskLevel: string;
    calculatedDate: Date;
}
//# sourceMappingURL=index.d.ts.map