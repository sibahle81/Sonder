import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';
import { LocationCategoryEnum } from 'projects/shared-models-lib/src/lib/enums/location-category-enum';
import { AdviseMethodEnum } from '../../enums/advise-method-enum';
import { EventStatusEnum } from '../../enums/event-status-enum';
import { EventTypeEnum } from '../../enums/event-type-enum';
import { PersonEventModel } from './personEvent.model';
import { Note } from 'projects/shared-components-lib/src/lib/notes/note';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { ProductCategoryTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/product-category-type.enum';

export class EventModel extends BaseClass {
    eventId: number;
    memberSiteId: number | null;
    eventIsAtCompany: boolean;
    description: string;
    eventReferenceNumber: string;
    eventDate: Date | string;
    locationCategory: LocationCategoryEnum | null;
    numberOfInjuredEmployees: number | null;
    numberOfDeceasedEmployees: number | null;
    eventStatus: EventStatusEnum;
    adviseMethod: AdviseMethodEnum;
    eventType: EventTypeEnum;
    dateAdvised: Date | string;
    wizardId: number | null;
    riskAddressId: number;
    adviseMethodId: number
    
    eventNotes: Note[];
    personEvents: PersonEventModel[];

    companyRolePlayer: RolePlayer;
    productCategoryType?:ProductCategoryTypeEnum;
}
