import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

/** @description this class hold the file upload details. */

export class UploadFile extends BaseClass {
    name: string;
    size: string;
    mimeType: string;
    url: string;
    token: string;
    error: string;
    file: any;
    hasError: boolean;
    hasUploaded: boolean;
    isLoading: boolean;
    importId: number;
    message: string;
    documentType: string;
}
