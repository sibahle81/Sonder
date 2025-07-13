import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class ClaimCancellationReasonsModel extends BaseClass {
    reasonId: number;
    reasonDescription: string;
}

export class ClaimReOpenReasonsModel extends BaseClass {
    reasonId: number;
    reasonDescription: string;
}

export class ClaimRepayReasonsModel extends BaseClass {
    reasonId: number;
    reasonDescription: string;
}