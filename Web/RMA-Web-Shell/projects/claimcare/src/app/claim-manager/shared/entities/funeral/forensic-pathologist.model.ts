import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class ForensicPathologistModel extends BaseClass {
    FuneralRegistryDetailId: number;
    firstName: string;
    lastName: string;
    contactNumber: string;
    isValid: boolean;
    dateOfPostMortem: Date;
    mortuaryName: string;
    postMortemNumber: string;
    bodyNumber: string;
    sapCaseNumber: string;
    registrationNumber: string;
}
