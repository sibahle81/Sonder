import { PractitionerTypeEnum } from "../enums/practitioner-type-enum";

export class MedicalServiceProviderModel {
    rolePlayerId: number;
    name: string;
    description: string;
    contactNumber: string;
    practiceNo: string;
    datePracticeStarted: Date;
    datePracticeClosed?: Date;
    practitionerTypeId: number;
    practitionerType: PractitionerTypeEnum;
    vatRegistrationNo: string;
    consultingPartnerTypeId?: number;
    practiceDiscipline: string;
    practiceSubDiscipline: string;
    providerDiscipline: string;
    providerSubDiscipline: string;
    isPreferred: boolean;
    isMedInvoiceTreatmentInfoProvided: boolean;
    isMedInvoiceInjuryInfoProvided: boolean;
    dispensingLicenseNo: string;
    allowSameDayTreatment: boolean;
    isAuthorised: boolean;
    isDeleted: boolean;
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;
    lastName: string;

}
