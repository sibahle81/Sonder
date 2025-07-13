import { DaysOffLookup } from './days-off-lookup';
import { MedicalCostLookup } from './medical-cost-lookup';
import { PdExtentLookup } from './pd-extent-lookup';

export interface Icd10CodeEstimateLookup {
    icd10CodeEstimateLookupId: number;
    icd10GroupMapId: number;
    productOptionId: number | null;
    medicalCostLookupId: number | null;
    pdExtentLookupId: number | null;
    daysOffLookupId: number | null;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    isDeleted: boolean;
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;

    daysOffLookup: DaysOffLookup;
    medicalCostLookup: MedicalCostLookup;
    pdExtentLookup: PdExtentLookup;
}
