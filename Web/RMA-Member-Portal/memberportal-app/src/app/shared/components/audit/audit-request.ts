import { ServiceType } from '../../enums/service-type.enum';

export class AuditRequest {
    constructor(
        readonly serviceType: ServiceType,
        readonly itemType: number,
        readonly itemId: number) {
    }
}