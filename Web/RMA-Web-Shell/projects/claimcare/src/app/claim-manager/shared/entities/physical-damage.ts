import { Injury } from './injury';
export class PhysicalDamage {
    physicalDamageId: number;
    icd10DiagnosticGroupId: number;
    personEventId: number;
    description: string;
    isDeleted: boolean;
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;
    injuries: Injury[];
    icdCategoryId: number;
    icdSubCategoryId: number;

    // Internal Fields
    count: number;
    icd10SelectionType: string;
}
