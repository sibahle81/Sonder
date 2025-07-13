import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class ClientCoverOption extends BaseClass {
    clientCoverId: number;
    productOptionCoverId: number;
    numberOfMembers: number;
    premium: number;
    productOptionName: string;
    isMainFamily: boolean;
    totalPerLine: number;
    productOptionId: number;
}
