import { Component, Input } from '@angular/core';
import { Claim } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/claim.model';
import { EventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/event.model';
import { PersonEventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/personEvent.model';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { ModuleTypeEnum } from 'projects/shared-models-lib/src/lib/enums/module-type-enum';
import { NoteItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/note-item-type-enum';
import { ReferralItemTypeEnum } from 'projects/shared-models-lib/src/lib/referrals/referral-item-type-enum';

@Component({
  selector: 'person-event-medi-view',
  templateUrl: './person-event-view.component.html',
  styleUrls: ['./person-event-view.component.css']
})
export class PersonEventViewComponent {
  moduleType = [ModuleTypeEnum.MediCare];
  noteItemType = NoteItemTypeEnum.PersonEvent;
  documentSystemName = DocumentSystemNameEnum.MediCareManager;
  targetModuleType = ModuleTypeEnum.ClaimCare;
  referralItemType = ReferralItemTypeEnum.PersonEvent;
  referralItemTypeReference: string;
  @Input() selectedPersonEvent: PersonEventModel;
  @Input() selectedClaim: Claim;
  triggerRefresh: false;
  @Input() event: EventModel;
  
  setSelectedClaim($event: Claim) {
    this.selectedClaim = $event;
  }
}
