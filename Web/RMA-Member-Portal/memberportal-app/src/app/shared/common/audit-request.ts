// wiki: http://bit.ly/2AxAnO5
// The base class for all model classes.

import { AuditItemTypeEnum } from "../enums/audit-item-type.enum";

/** @description The base class for all model classes. */
export class AuditRequest {
    itemId: number;
    itemType: AuditItemTypeEnum;
}