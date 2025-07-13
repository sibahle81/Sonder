import { TemplateTypeEnum } from 'projects/shared-models-lib/src/lib/enums/template-type-enum';

export class ClaimEmail {
    personEventId: number;
    claimId: number;
    templateType: TemplateTypeEnum;
    emailAddress: string;
    tokens: { [key: string]: string };
    documentId: number | null;
}
