import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';


export class SupportingDocument extends BaseClass {
    linkedItemId: number;
    linkedItemType: string;
    documentName: string;
    documentToken: string;
}
