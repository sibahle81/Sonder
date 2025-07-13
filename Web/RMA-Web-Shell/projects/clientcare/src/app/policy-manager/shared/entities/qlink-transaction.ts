import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';
import { QLinkTransactionTypeEnum } from 'projects/shared-models-lib/src/lib/enums/qlink-transaction-type-enum';

export class QlinkTransaction extends BaseClass {
    qlinkTransactionId: number;
    qLinkTransactionType: QLinkTransactionTypeEnum;
    itemType: string;
    itemId: number;
    request: string;
    response: string;
    statusCode: number;
    isDeleted: boolean;
    createdDate: Date;
    createdBy: string;
    modifiedDate: Date;
    modifiedBy: string;
    policyNumber: string;
    policyPremium: number;
    policyStatus: string;
}
