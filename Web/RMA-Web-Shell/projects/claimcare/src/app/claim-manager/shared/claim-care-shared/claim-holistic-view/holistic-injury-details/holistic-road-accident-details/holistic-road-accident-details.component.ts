import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ModeEnum } from 'projects/shared-models-lib/src/lib/enums/mode-enum';
import { PersonEventModel } from '../../../../entities/personEvent/personEvent.model';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'holistic-road-accident-details',
  templateUrl: './holistic-road-accident-details.component.html',
  styleUrls: ['./holistic-road-accident-details.component.css']
})
export class HolisticRoadAccidentDetailsComponent extends UnSubscribe implements OnChanges {

  @Input() selectedPersonEvent: PersonEventModel;
  @Input() isWizard = false;
  @Input() isReadOnly = false;
  @Input() roadAccidentValid = new BehaviorSubject(false);

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  viewMode = ModeEnum.View;
  form: UntypedFormGroup;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly claimService: ClaimCareService
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.createForm();
    this.getLookups();
    this.patchForm();
    this.checkStatus();
  }

  getLookups() { }

  checkStatus() {
    this.form.statusChanges.pipe(distinctUntilChanged()).subscribe((status) => {
      if (status == 'VALID') {
        this.roadAccidentValid.next(true);
      }
    });
  }

  createForm() {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      vehicleMake: [{ value: '', disabled: this.isReadOnly }],
      vehicleRegistration: [{ value: '', disabled: this.isReadOnly }],
      otherVehicleMake: [{ value: '', disabled: this.isReadOnly }],
      otherVehicleRegistration: [{ value: '', disabled: this.isReadOnly }],
      policeReference: [{ value: '', disabled: this.isReadOnly }],
      policeStationName: [{ value: '', disabled: this.isReadOnly }],
      isBusiness: [{ value: '', disabled: this.isReadOnly }],
      onCallout: [{ value: '', disabled: this.isReadOnly }],
      isTraining: [{ value: '', disabled: this.isReadOnly }],
      toWork: [{ value: '', disabled: this.isReadOnly }],
      onPrivateRoad: [{ value: '', disabled: this.isReadOnly }],
      onPublicRoad: [{ value: '', disabled: this.isReadOnly }],
      onStandBy: [{ value: '', disabled: this.isReadOnly }],
    });

    if (this.isWizard && !this.isReadOnly) {
      this.editForm();
    }
  }

  patchForm() {
    this.form.patchValue({
      vehicleMake: this.selectedPersonEvent.personEventAccidentDetail ? this.selectedPersonEvent.personEventAccidentDetail.vehicleMake : null,
      vehicleRegistration: this.selectedPersonEvent.personEventAccidentDetail ? this.selectedPersonEvent.personEventAccidentDetail.thirdPartyVehicleMake : null,
      otherVehicleMake: this.selectedPersonEvent.personEventAccidentDetail ? this.selectedPersonEvent.personEventAccidentDetail.vehicleMake : null,
      otherVehicleRegistration: this.selectedPersonEvent.personEventAccidentDetail ? this.selectedPersonEvent.personEventAccidentDetail.thirdPartyVahicleRegNo : null,
      policeReference: this.selectedPersonEvent.personEventAccidentDetail ? this.selectedPersonEvent.personEventAccidentDetail.policeReferenceNo : null,
      policeStationName: this.selectedPersonEvent.personEventAccidentDetail ? this.selectedPersonEvent.personEventAccidentDetail.policeStationName : null,

      isBusiness: this.selectedPersonEvent.personEventAccidentDetail ? this.selectedPersonEvent.personEventAccidentDetail.isOnBusinessTravel : null,
      onCallout: this.selectedPersonEvent.personEventAccidentDetail ? this.selectedPersonEvent.personEventAccidentDetail.isOnCallout : null,
      isTraining: this.selectedPersonEvent.personEventAccidentDetail ? this.selectedPersonEvent.personEventAccidentDetail.isTrainingTravel : null,
      toWork: this.selectedPersonEvent.personEventAccidentDetail ? this.selectedPersonEvent.personEventAccidentDetail.isTravelToFromWork : null,
      onPrivateRoad: this.selectedPersonEvent.personEventAccidentDetail ? this.selectedPersonEvent.personEventAccidentDetail.isPrivateRoad : null,
      onPublicRoad: this.selectedPersonEvent.personEventAccidentDetail ? this.selectedPersonEvent.personEventAccidentDetail.isPublicRoad : null,
      roadAccident: this.selectedPersonEvent.personEventAccidentDetail ? this.selectedPersonEvent.personEventAccidentDetail.isRoadAccident : false,
      onStandBy: this.selectedPersonEvent.personEventAccidentDetail ? this.selectedPersonEvent.personEventAccidentDetail.isOnStandby : null,
    });
    this.isLoading$.next(false);
  }

  readForm(): PersonEventModel {
    if (!this.form.valid) {
      return;
    }
    const formDetails = this.form.getRawValue();
    const personEvent = this.selectedPersonEvent;

    this.selectedPersonEvent.personEventAccidentDetail.vehicleMake = formDetails.vehicleMake;
    this.selectedPersonEvent.personEventAccidentDetail.vehicleRegNo = formDetails.vehicleRegistration;
    this.selectedPersonEvent.personEventAccidentDetail.thirdPartyVehicleMake = formDetails.otherVehicleMake;
    this.selectedPersonEvent.personEventAccidentDetail.thirdPartyVahicleRegNo = formDetails.otherVehicleRegistration;
    this.selectedPersonEvent.personEventAccidentDetail.policeReferenceNo = formDetails.policeReference;
    this.selectedPersonEvent.personEventAccidentDetail.policeStationName = formDetails.policeStationName;

    this.selectedPersonEvent.personEventAccidentDetail.isOnBusinessTravel = formDetails.isOnBusinessTravel ? formDetails.isOnBusinessTravel : false;
    this.selectedPersonEvent.personEventAccidentDetail.isOnCallout = formDetails.onCallout ? formDetails.onCallout : false;
    this.selectedPersonEvent.personEventAccidentDetail.isTrainingTravel = formDetails.isTraining ? formDetails.isTraining : false;
    this.selectedPersonEvent.personEventAccidentDetail.isTravelToFromWork = formDetails.toWork ? formDetails.toWork : false;
    this.selectedPersonEvent.personEventAccidentDetail.isPrivateRoad = formDetails.onPrivateRoad ? formDetails.onPrivateRoad : false;
    this.selectedPersonEvent.personEventAccidentDetail.isPublicRoad = formDetails.onPublicRoad ? formDetails.onPublicRoad : false;
    this.selectedPersonEvent.personEventAccidentDetail.isRoadAccident = formDetails.roadAccident ? formDetails.roadAccident : false;
    this.selectedPersonEvent.personEventAccidentDetail.isOnStandby = formDetails.onStandBy ? formDetails.onStandBy : false;

    return personEvent;
  }

  travelTypeChange(value: any, type: string): void {
    switch (type) {
      case 'isBusiness':
        if (value.checked) {
          this.form.get('isTraining').setValue(false);
          this.form.get('toWork').setValue(false);
        }
        break;
      case 'isTraining':
        if (value.checked) {
          this.form.get('isBusiness').setValue(false);
          this.form.get('toWork').setValue(false);
        }
        break;
      case 'toWork':
        if (value.checked) {
          this.form.get('isBusiness').setValue(false);
          this.form.get('isTraining').setValue(false);
        }
        break;
    }
  }

  save() {
    this.isLoading$.next(true);
    const details = this.readForm();
    this.selectedPersonEvent = details;

    if (details && details !== undefined) {
      this.claimService.updatePersonEvent(details).pipe(takeUntil(this.unSubscribe$)).subscribe(result => {
        this.reset();
        this.isLoading$.next(false);
      });
    }
  }

  editForm() {
    this.form.enable();
    this.isReadOnly = false;
  }

  cancel() {
    this.reset();
  }

  reset() {
    this.isReadOnly = true;
    this.form.disable();
  }
}
