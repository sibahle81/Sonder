import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { PersonEventModel } from '../../../shared/entities/personEvent/personEvent.model';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ClaimCareService } from '../../../Services/claimcare.service';
import { NoteItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/note-item-type-enum';
import { ModuleTypeEnum } from 'projects/shared-models-lib/src/lib/enums/module-type-enum';
import { KeyValue } from '@angular/common';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';

@Component({
  templateUrl: './upload-section90-review-report.component.html',
  styleUrls: ['./upload-section90-review-report.component.css'],
})
export class UploadSection90ReviewReportComponent extends WizardDetailBaseComponent<PersonEventModel> implements OnInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  selectedPersonEvent: PersonEventModel;

  allRequiredDocumentsUploaded = false;
  documentSet = DocumentSetEnum.Section90ReviewNotice;
  documentSystemName = DocumentSystemNameEnum.ClaimManager;
  forceRequiredDocumentTypeFilter = [DocumentTypeEnum.Section90ReviewNoticeLetter];
  
  moduleType = [ModuleTypeEnum.ClaimCare];
  noteItemType = NoteItemTypeEnum.PersonEvent;

  rolePlayerContactOptions: KeyValue<string, number>[];
  
  constructor(
    private readonly appEventsManager: AppEventsManager,
    readonly activatedRoute: ActivatedRoute,
    readonly authService: AuthService,
    private readonly claimService: ClaimCareService,) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() { }

  onLoadLookups() { }

  createForm() { }

  populateModel() { }

  populateForm() {
    this.rolePlayerContactOptions = [
      { key: 'Employer', value: this.model.companyRolePlayerId },
      { key: 'Employee', value: this.model.insuredLifeId }
    ];
    
    this.getEvent();
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {

    if (!this.allRequiredDocumentsUploaded) {
      validationResult.errors++;
      validationResult.errorMessages.push('section 90 review notice document is required');
    }
    return validationResult;
  }

  getEvent() {
    this.claimService.getEvent(this.model.eventId).subscribe(result => {
      this.model.event = result;
      this.selectedPersonEvent = result.personEvents.find(p => p.personEventId == this.model.personEventId);
      this.isLoading$.next(false);
    });
  }

  isRequiredDocumentsUploaded(isUploaded: boolean) {
    this.allRequiredDocumentsUploaded = isUploaded;
  }
}
