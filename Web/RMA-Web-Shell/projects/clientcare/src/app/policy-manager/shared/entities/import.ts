import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class Import extends BaseClass {
    importTypeId: number;
    fileRefToken: string;
    status: string;
    recordCount: number;
    processedCount: number;
    retryCount: number;
    lastError: string;
    fileName: string;
}
