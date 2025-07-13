import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { SuspiciousTransactionStatusEnum } from 'projects/shared-models-lib/src/lib/enums/suspicious-transaction-status-enum';
import { BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ParentInsuranceType } from '../../../../entities/parentInsuranceType';
import { PersonEventModel } from '../../../../entities/personEvent/personEvent.model';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { PersonEventAccidentDetail } from '../../../../entities/funeral/person-event-accident-detail';
import { PersonEventDeathDetailModel } from '../../../../entities/personEvent/personEventDeathDetail.model';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { GeneralAuditDialogComponent } from 'projects/clientcare/src/app/shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { ClaimItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-type-enum';

@Component({
  selector: 'holistic-accident-checks',
  templateUrl: './holistic-accident-checks.component.html',
  styleUrls: ['./holistic-accident-checks.component.css']
})
export class HolisticAccidentChecksComponent extends UnSubscribe implements OnChanges {

  @Input() selectedPersonEvent: PersonEventModel;
  @Input() isWizard = false;
  @Input() isReadOnly = false;
  @Input() eventType = false;

  @Output() refreshPage: EventEmitter<PersonEventModel> = new EventEmitter();
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  form: UntypedFormGroup;
  isRoadAccident = false;
  leadToDeath = false;
  isNewDeathDetail = false;
  maxDate = new Date();

  suspiciousTransactions: SuspiciousTransactionStatusEnum[];
  parentInsuranceTypes: ParentInsuranceType[];

  requiredAddPermission = 'View Injury Details';
  hasAddPermission = false;
  requiredAuditPermission = 'View Audits';
  hasAuditPermission = false;

  constructor(
    private readonly claimService: ClaimCareService,
    private readonly formBuilder: UntypedFormBuilder,
    public dialog: MatDialog
  ) {
    super();
    this.lookups();
  }

  lookups() { }

  ngOnChanges(changes: SimpleChanges): void {
    this.hasAuditPermission = userUtility.hasPermission(this.requiredAuditPermission);
    this.createForm();
    this.getData();
  }

  createForm() {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      isAssault: [{ value: '', disabled: this.isReadOnly }],
      isHijack: [{ value: '', disabled: this.isReadOnly }],
      dentures: [{ value: '', disabled: this.isReadOnly }],
      spectacles: [{ value: '', disabled: this.isReadOnly }],
      isStp: [{ value: '', disabled: this.isReadOnly }],
      atWorkPlace: [{ value: '', disabled: this.isReadOnly }],
      inScopeOfDuty: [{ value: '', disabled: this.isReadOnly }],
      roadAccident: [{ value: '', disabled: this.isReadOnly }],
      ledToDeath: [{ value: '', disabled: this.isReadOnly }],
    });
  }

  getData() {
    this.claimService.getPersonEventInjuryDetails(this.selectedPersonEvent.personEventId).subscribe(result => {
      if (result) {
        this.selectedPersonEvent = result;
        this.patchForm();
        this.isLoading$.next(false);
      }
    })
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  patchForm() {
    this.form.patchValue({
      isAssault: this.selectedPersonEvent.isAssault,
      isHijack:this.selectedPersonEvent.isHijack,
      dentures: this.selectedPersonEvent.isDentures,
      spectacles: this.selectedPersonEvent.isSpectacles,
      isStp: this.selectedPersonEvent.isStraightThroughProcess,
      atWorkPlace: this.selectedPersonEvent.personEventAccidentDetail?.isOccurAtNormalWorkplace ? this.selectedPersonEvent.personEventAccidentDetail.isOccurAtNormalWorkplace : false,
      inScopeOfDuty: this.selectedPersonEvent.personEventAccidentDetail?.isOccurPerformingScopeofDuty ? this.selectedPersonEvent.personEventAccidentDetail?.isOccurPerformingScopeofDuty : false,
      roadAccident: this.selectedPersonEvent.personEventAccidentDetail?.isRoadAccident ? this.selectedPersonEvent.personEventAccidentDetail?.isRoadAccident : false,
    });

    if (this.selectedPersonEvent.personEventDeathDetail) {
      this.form.patchValue({
        ledToDeath: true
      });
    }
  }

  editForm() {
    this.form.enable();
    this.isReadOnly = false;
    this.form.controls.ledToDeath.disable();
  }

  cancel() {
    this.reset();
  }

  reset() {
    this.isReadOnly = true;
    this.form.disable();
  }

  readForm(): PersonEventModel {
    if (!this.form.valid) {
      return;
    }
    const formDetails = this.form.getRawValue();
    const personEvent = this.selectedPersonEvent;

    personEvent.isAssault = formDetails.isAssault;
    personEvent.isHijack = formDetails.isHijack;
    personEvent.isDentures = formDetails.dentures;
    personEvent.isSpectacles = formDetails.spectacles;
    personEvent.isStraightThroughProcess = formDetails.isStp;

    if (personEvent?.personEventAccidentDetail) {
      personEvent.personEventAccidentDetail.isOccurAtNormalWorkplace = formDetails.atWorkPlace;
      personEvent.personEventAccidentDetail.isOccurPerformingScopeofDuty = formDetails.inScopeOfDuty;
      personEvent.personEventAccidentDetail.isRoadAccident = formDetails.roadAccident;
    }
    return personEvent;
  }

  save() {
    this.isLoading$.next(true);
    const details = this.readForm();
    if (!details.personEventNoiseDetail || !details.personEventNoiseDetail.PersonEventId) {
      details.personEventNoiseDetail = null;
    }
    if (details && details !== undefined && !this.isNewDeathDetail) {
      this.claimService.updatePersonEvent(details).pipe(takeUntil(this.unSubscribe$)).subscribe(result => {
        this.reset();
        this.refreshPage.emit(this.selectedPersonEvent);
        this.isLoading$.next(false);
      });
    } else {
      this.reset();
      this.refreshPage.emit(this.selectedPersonEvent);
      this.isLoading$.next(false);
    };
  }

  isRoadAccidentChange($event: any) {
    this.isRoadAccident = $event.checked;
    if (this.isRoadAccident) {
      if (!this.selectedPersonEvent.personEventAccidentDetail) {
        this.selectedPersonEvent.personEventAccidentDetail = new PersonEventAccidentDetail();
        this.selectedPersonEvent.personEventAccidentDetail.isRoadAccident = this.isRoadAccident;
      }
      this.form.get('isAssault').setValue(false);
      this.form.get('isHijack').setValue(false);
    }
  }

  leadToDeathChange($event: any) {
    this.leadToDeath = $event.checked;
    if (this.leadToDeath) {
      if (!this.selectedPersonEvent.personEventDeathDetail) {
        this.selectedPersonEvent.personEventDeathDetail = new PersonEventDeathDetailModel();
        this.isNewDeathDetail = true;
      }
    } else {
      this.selectedPersonEvent.personEventDeathDetail = null;
    }
  }

  resetRoadAccidentForm() {
    this.form.reset();
  }

  isHijack($event: any)
  {
    this.leadToDeath = $event.checked;
  }
  openAuditDialog(selectedPersonEvent: PersonEventModel) {
    const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
      width: '70%',
      data: {
        serviceType: ServiceTypeEnum.ClaimManager,
        clientItemType: ClaimItemTypeEnum.PersonEventAccidentDetail,
        itemId: selectedPersonEvent.personEventId,
        heading: 'Accident Details Audit',
        propertiesToDisplay: ['IsOccurAtNormalWorkplace','IsOccurPerformingScopeofDuty','IsRoadAccident','IsOnBusinessTravel','IsTrainingTravel','IsTravelToFromWork',
                              'IsOnCallout','IsOnStandby','IsPublicRoad','IsPrivateRoad']
      }
    });
  }
  
}
