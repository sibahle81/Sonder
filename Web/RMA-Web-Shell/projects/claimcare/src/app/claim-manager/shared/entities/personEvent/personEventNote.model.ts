import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class PersonEventNoteModel extends BaseClass {
    PersonEventNoteId: number;
    PersonEventId: number;
    Text: string;
    IsDeleted: boolean;
    CreatedBy: string;
    CreatedDate: Date;
    ModifiedBy: string;
    ModifiedDate: Date;
}
