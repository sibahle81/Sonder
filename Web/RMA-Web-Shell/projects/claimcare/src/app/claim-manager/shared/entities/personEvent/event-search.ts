import { EventTypeEnum } from '../../enums/event-type-enum';

export class EventSearch {
    eventId: number;
    eventNumber: string;
    memberNumber: string;
    memberName: string;
    eventType: EventTypeEnum;
    createdDate: Date | string;
    eventTypeDescription: string;
    dateOfIncident: Date;
}
