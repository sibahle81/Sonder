import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';
import { SupportingDocument } from './supporting-document';

export class SupportingDocumentImportRequest extends BaseClass {
    documents: SupportingDocument[];
}
