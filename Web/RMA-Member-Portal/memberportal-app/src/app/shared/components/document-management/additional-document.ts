import { CommunicationTypeEnum } from "../../enums/communication-type.enum";
import { DocumentSetEnum } from "../../enums/document-set.enum";

export class AdditionalDocument {
    claimId?: number;
    documentTypeIds: number[];
    email: string;
    documentSet: DocumentSetEnum;
    system: string;
    communicationType: CommunicationTypeEnum;
    // keys being passed to document keys table consisting of the following(key: 'The id name {claimId}' value: 'The actual id {69}')
    keys: { [key: string]: string };
}
