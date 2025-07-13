import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class Document extends BaseClass {

    policyid: number;
    name: string;
    mimeType: string;
    token: any;
    sizeInMb: number;
    // data: ByteString;
}
