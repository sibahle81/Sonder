import { DocumentSetEnum } from '../enums/document-set.enum';

export class DocumentsRequest {
    public personEventId ?: number;
    public claimId ?: number;
    public documentSet: DocumentSetEnum;
    public system: string;
    // keys being passed to document keys table consisting of the following(key: 'The id name {claimId}' value: 'The actual id {69}')
    public keys: { [key: string]: string };
}
