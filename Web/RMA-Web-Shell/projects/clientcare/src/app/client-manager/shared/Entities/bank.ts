import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class Bank extends BaseClass {
    name: string;
    universalBranchCode: string;
    isForeign: boolean;
}
