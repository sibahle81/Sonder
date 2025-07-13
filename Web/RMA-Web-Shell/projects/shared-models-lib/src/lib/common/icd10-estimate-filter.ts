import { EventTypeEnum } from '../../../../claimcare/src/app/claim-manager/shared/enums/event-type-enum';

export class ICD10EstimateFilter {
    eventType: EventTypeEnum;
    icd10Codes: string;
    reportDate: Date | string;
    icd10DiagnosticGroupId: number;
}

