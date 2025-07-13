import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';

export class NotesRequest {
    constructor(
        readonly serviceType: ServiceTypeEnum,
        readonly itemType: string,
        readonly itemId: number) {
    }
}
