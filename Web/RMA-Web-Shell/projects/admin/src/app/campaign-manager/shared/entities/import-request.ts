import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class ImportRequest extends BaseClass {
    campaignId: number;
    fileUri: string;
    fileToken: string;
}
