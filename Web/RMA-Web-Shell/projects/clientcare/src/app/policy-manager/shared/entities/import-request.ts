import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class ImportRequest  extends BaseClass {
    importType: number;
    importUri: string;
    importReference: string;
    isImportApproved: boolean;
}
