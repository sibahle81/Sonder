import { PagedRequest } from "projects/shared-models-lib/src/lib/pagination/PagedRequest";
import { RecoveryReceiptTypeEnum } from "../../shared/enum/recovery-receipt-type-enum";

export class RecoveryReceiptSearchRequest {
        recoveryReceiptType: RecoveryReceiptTypeEnum;
        recoveredByRolePlayerId: number;
        eventId: number;
        startDate: Date;
        endDate: Date;

        pagedRequest: PagedRequest;
}