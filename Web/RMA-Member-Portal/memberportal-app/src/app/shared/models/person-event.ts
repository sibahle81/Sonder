import { DocumentSetEnum } from "../enums/document-set.enum";
import { PersonEventAccidentDetail } from "./person-event-accident-detail";
import { PersonEventDeathDetail } from "./person-event-death-detail";
import { PersonEventDiseaseDetail } from "./person-event-disease-detail";
import { PersonEventNoiseDetail } from "./person-event-noise-detail";


export class PersonEvent {
  personEventId: number;
  createdBy: string;
  modifiedBy: string;
  createdDate: Date;
  modifiedDate: Date;
  isDeleted: boolean;
  firstName: string;
  lastName: string;
  personEventReferenceNumber: string;
  eventId: number;
  insuredLifeId: number;
  claimantId: number;
  informantId: number;
  personEventStatusId: number;
  personEventBucketClassId: number;
  dateReceived: Date;
  dateCaptured: Date;
  capturedByUserId: number;
  dateSubmitted: Date;
  submittedByUserId: number;
  dateAuthorised: Date;
  authorisedByUserId: number;
  dateRejected: Date;
  rejectedByUserId: number;
  documentSetId: number;
  rejectionReason: string;
  documentSetEnum?: DocumentSetEnum;
  personEventAccidentDetail: PersonEventAccidentDetail;
  personEventDeathDetail: PersonEventDeathDetail;
  personEventDiseaseDetail: PersonEventDiseaseDetail;
  personEventNoiseDetail: PersonEventNoiseDetail;
  sendBrokerEmail: boolean;
}
