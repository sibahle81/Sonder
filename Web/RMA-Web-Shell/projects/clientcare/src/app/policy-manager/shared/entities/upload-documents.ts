import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class UploadDocument  extends BaseClass {
    name: string;
    documentToken: string;
    policyId: number;
    requiredDocumentId: number;
    requiredDocumentName: string;
}
