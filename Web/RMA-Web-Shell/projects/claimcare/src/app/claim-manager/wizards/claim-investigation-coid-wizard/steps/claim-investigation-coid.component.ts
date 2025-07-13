import { Component } from '@angular/core';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { PersonEventModel } from '../../../shared/entities/personEvent/personEvent.model';
import { ClaimCareService } from '../../../Services/claimcare.service';
import { EventTypeEnum } from '../../../shared/enums/event-type-enum';
import { BehaviorSubject } from 'rxjs';
import { ModuleTypeEnum } from 'projects/shared-models-lib/src/lib/enums/module-type-enum';
import { NoteItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/note-item-type-enum';
import { ReferralItemTypeEnum } from 'projects/shared-models-lib/src/lib/referrals/referral-item-type-enum';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { KeyValue } from '@angular/common';

@Component({
  templateUrl: './claim-investigation-coid.component.html',
  styleUrls: ['./claim-investigation-coid.component.css']
})
export class ClaimInvestigationCoidComponent extends WizardDetailBaseComponent<PersonEventModel> {
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  defaultTab = 5;
  eventTypeLabel: string;

  moduleType = [ModuleTypeEnum.ClaimCare];
  noteItemType = NoteItemTypeEnum.PersonEvent;

  targetModuleType = ModuleTypeEnum.ClaimCare;
  referralItemType = ReferralItemTypeEnum.PersonEvent;
  documentSystemName = DocumentSystemNameEnum.ClaimManager;
  documentSet = DocumentSetEnum.InvestigationDocuments;
  requiredDocumentsUploaded = false;

  rolePlayerContactOptions: KeyValue<string, number>[];

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly claimService: ClaimCareService) {
    super(appEventsManager, authService, activatedRoute);
  }

  onLoadLookups(): void { }

  createForm(id: number): void { }

  populateModel(): void { }

  populateForm(): void {
    this.rolePlayerContactOptions = [
      { key: 'Employer', value: this.model.companyRolePlayerId },
      { key: 'Employee', value: this.model.insuredLifeId }
    ];

    this.getEvent();
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (!this.requiredDocumentsUploaded) {
      validationResult.errors++;
      validationResult.errorMessages.push('Required documents not uploaded');
    }
    return validationResult;
  }

  getEvent() {
    this.claimService.getEvent(this.model.eventId).subscribe(result => {
      this.model.event = result;
      this.eventTypeLabel = result.eventType === EventTypeEnum.Disease ? 'Disease' : 'Injury';
      this.isLoading$.next(false);
    });
  }

  setRequiredDocumentsUploaded($event: boolean) {
    this.requiredDocumentsUploaded = $event;
  }
}
