import { ServiceType } from '../../shared/enums/service-type.enum';

export class AuditRequest {
    constructor(
        readonly serviceType: ServiceType,
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
