import { ServiceType } from '../../enums/service-type.enum';

export class NotesRequest {
    constructor(
        readonly serviceType: ServiceType,
        readonly itemType: string,
        readonly itemId: number) {
    }
}
