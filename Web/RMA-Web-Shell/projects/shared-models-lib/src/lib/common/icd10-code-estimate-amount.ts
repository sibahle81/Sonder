export interface Icd10CodeEstimateAmount {
    icd10CodeEstimateLookupId: number;
    icd10Code: string;
    icd10DiagnosticGroupId: number;
    medicalMinimumCost: number;
    medicalAverageCost: number;
    medicalMaximumCost: number;
    pdExtentMinimum: number;
    pdExtentAverage: number;
    pdExtentMaximum: number;
    daysOffMinimum: number;
    daysOffAverage: number;
    daysOffMaximum: number;
}
