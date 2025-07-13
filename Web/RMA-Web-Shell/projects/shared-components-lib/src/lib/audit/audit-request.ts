import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';

export class AuditRequest {
    constructor(
        readonly serviceType: ServiceTypeEnum,
        readonly itemType: number,
        readonly itemId: number) {
    }
}
