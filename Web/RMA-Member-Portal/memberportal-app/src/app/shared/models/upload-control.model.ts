
/** @description this class hold the file upload details. */

import { BaseClass } from '../../core/models/base-class';

export class UploadControl extends BaseClass {
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
