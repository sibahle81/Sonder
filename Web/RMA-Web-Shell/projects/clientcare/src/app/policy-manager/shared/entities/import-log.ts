import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class ImportLog extends BaseClass {
    importId: number;
    message: string;
    rowNumber: number;
}
