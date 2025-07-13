import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';

export class AuditRequest {
    constructor(
        readonly serviceType: ServiceTypeEnum,
        readonly itemType: number,
        readonly itemId: number) {
    }
}

export class AuditResult {
    id: string;
    itemId: string;
    itemType: string;
    date: string;
    username: string;
    action: string;
    oldItem: string;
    newItem: string;
    propertyDetails: AuditLogPropertyDetail[];
    lookupDetails: AuditLogLookupDetail;
    corrolationToken: string;
    wizardId: number;
}

export class AuditLogPropertyDetail {
    propertyName: string;
    oldValue: string;
    newValue: string;
    hasChanged: boolean;
}

export class AuditLogLookupDetail {
    itemType: string;
    lookupAuditResultDetails: LookupAuditItem[];
}

export class LookupAuditItem {
    status: string;
    value: string;
}
