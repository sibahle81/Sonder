export class DiseaseType {
    diseaseTypeId: number;
    name: string;
    description: string;
    diseaseCode: string;
    parentInsuranceTypeId: number;
    isActive: boolean;
    isDeleted: boolean;
    createdBy: string;
    createdDate: Date | string;
    modifiedBy: string;
    modifiedDate: Date | string;
}