import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';
import { CommunicationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/communication-type-enum';
import { ContactDesignationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/contact-designation-type-enum';
import { TitleEnum } from 'projects/shared-models-lib/src/lib/enums/title-enum';

export class Contact extends BaseClass  {
    branchId?: number;
    departmentId?: number;
    designation?: string;
    name?: string;
    contactTypeId?: number;
    personTitleId?: number;
    telephoneNumber?: string;
    mobileNumber?: string;
    email?: string;
    serviceTypeIds?: number[];
    itemId?: number;
    itemType?: string;
    unsubscribe: boolean;
    workNumber?: string;
    otherNumber?: string;
    communicationType?: CommunicationTypeEnum;
    contactDesignationType?: ContactDesignationTypeEnum;
    title?: TitleEnum;
    emailAddress?: string;
    contactNumber?: string;
}
