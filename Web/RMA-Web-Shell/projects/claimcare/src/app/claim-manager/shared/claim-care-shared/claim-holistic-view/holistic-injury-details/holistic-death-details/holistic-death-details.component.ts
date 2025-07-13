import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ModeEnum } from 'projects/shared-models-lib/src/lib/enums/mode-enum';
import { PersonEventModel } from '../../../../entities/personEvent/personEvent.model';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { MatDialog } from '@angular/material/dialog';
import { GeneralAuditDialogComponent } from 'projects/clientcare/src/app/shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { ClaimItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-type-enum';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
  selector: 'holistic-death-details',
  templateUrl: './holistic-death-details.component.html',
  styleUrls: ['./holistic-death-details.component.css']
})
export class HolisticDeathDetailsComponent extends UnSubscribe implements OnChanges {

  @Input() selectedPersonEvent: PersonEventModel;
  @Input() isWizard = false;
  @Input() isReadOnly = false;

  @Output() refreshPage: EventEmitter<PersonEventModel> = new EventEmitter();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  viewMode = ModeEnum.View;
  form: UntypedFormGroup;
  maxDate = new Date();
  requiredAuditPermission = 'View Audits';
  hasAuditPermission = false;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly claimService: ClaimCareService,
    public dialog: MatDialog
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.hasAuditPermission = userUtility.hasPermission(this.requiredAuditPermission);
    this.createForm();
    this.getLookups();
    this.patchForm();
  }

  getLookups() { }

  createForm() {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      deathDate: [{ value: '', disabled: this.isReadOnly }],
      causeOfDeath: [{ value: '', disabled: this.isReadOnly }],
      deathCertificateNumber: [{ value: '', disabled: this.isReadOnly }],
    });

    if (this.isWizard && !this.isReadOnly) {
      this.editForm();
    }
  }

  editForm() {
    this.form.enable();
    this.isReadOnly = false;
  }

  patchForm() {
    this.form.patchValue({
      deathDate: this.selectedPersonEvent.personEventDeathDetail ? this.selectedPersonEvent.personEventDeathDetail.deathDate : null,
      causeOfDeath: this.selectedPersonEvent.personEventDeathDetail ? this.selectedPersonEvent.personEventDeathDetail.causeOfDeathDescription : null,
      deathCertificateNumber: this.selectedPersonEvent.personEventDeathDetail ? this.selectedPersonEvent.personEventDeathDetail.deathCertificateNo : null,
    });
    this.isLoading$.next(false);
  }

  readForm(): PersonEventModel {
    if (!this.form.valid) {
      return;
    }
    const formDetails = this.form.getRawValue();
    const personEvent = this.selectedPersonEvent;

    personEvent.personEventDeathDetail.deathDate = new Date(formDetails.deathDate);
    personEvent.personEventDeathDetail.causeOfDeathDescription = formDetails.causeOfDeath;
    personEvent.personEventDeathDetail.deathCertificateNo = formDetails.deathCertificateNumber;
    return personEvent;
  }

  cancel() {
    this.reset();
  }

  reset() {
    this.isReadOnly = true;
    this.form.disable();
  }

  save() {
    this.isLoading$.next(true);
    const details = this.readForm();
    this.selectedPersonEvent = details;

    if (details && details !== undefined) {
      this.claimService.updatePersonEvent(details).pipe(takeUntil(this.unSubscribe$)).subscribe(result => {
        this.reset();
        this.refreshPage.emit(this.selectedPersonEvent);
        this.isLoading$.next(false);
      });
    }
  }

  openAuditDialog(selectedPersonEvent: PersonEventModel) {
    const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
      width: '70%',
      data: {
        serviceType: ServiceTypeEnum.ClaimManager,
        clientItemType: ClaimItemTypeEnum.PersonEventDeathDetail,
        itemId: selectedPersonEvent.personEventId,
        heading: 'Death Details Audit',
        propertiesToDisplay: ['DeathType','Causeofdeath','DhaReferenceNo','DeathCertificateNo','InterviewWithFamilyMember','OpinionOfMedicalPractitioner',
                              'DeathDate','HomeAffairsRegion','PlaceOfDeath','DateOfPostMortem','PostMortemNumber','BodyNumber','SapCaseNumber','BodyCollectionDate',
                              'BodyCollectorId','UnderTakerId','FuneralParlorId','DoctorId','ForensicPathologistId','CauseOfDeathDescription']
      }
    });
  }
  
}
