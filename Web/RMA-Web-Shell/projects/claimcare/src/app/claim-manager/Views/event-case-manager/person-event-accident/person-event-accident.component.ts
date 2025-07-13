import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { DetailsComponent } from 'projects/shared-components-lib/src/lib/details-component/details-component';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { DatePipe } from '@angular/common';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { PersonEventAccidentDetail } from '../../../shared/entities/funeral/person-event-accident-detail';

@Component({
  selector: 'person-event-accident',
  templateUrl: './person-event-accident.component.html',
  styleUrls: ['./person-event-accident.component.css']
})
export class PersonEventAccidentComponent extends DetailsComponent implements OnInit {

  @Input() isGetPersonEventAccidentDetail: number;
  @Output() personEventAccidentEmit: EventEmitter<PersonEventAccidentDetail> = new EventEmitter();
  deathtypeId: number;

  constructor(
    router: Router,
    appEventsManager: AppEventsManager,
    alertService: AlertService,
    private readonly formBuilder: UntypedFormBuilder) {
    super(appEventsManager, alertService, router, '', '', 0);
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    if (this.isGetPersonEventAccidentDetail === 1) {
      this.personEventAccidentEmit.emit(this.readForm());
    }
  }

  createForm(id: any): void {
    if (this.form) {
      return;
    }

    this.form = this.formBuilder.group({
      id,
      isOccurAtNormalWorkplace: '',
      isRoadAccident: '',
      isOnBusinessTravel: '',
      isTrainingTravel: '',
      isTravelToFromWork: '',
      isOnCallout: '',
      isOnStandby: '',
      isPublicRoad: '',
      isPrivateRoad: '',
      vehicleMake: '',
      vehicleRegNo: '',
      thirdPartyVehicleMake: '',
      thirdPartyVahicleRegNo: '',
      policeReferenceNo: '',
      policeStationName: ''
    });
  }

  readForm(): PersonEventAccidentDetail {
    const personEventAccident = new PersonEventAccidentDetail();
    personEventAccident.isOccurAtNormalWorkplace = this.form.controls.isOccurAtNormalWorkplace.value;
    personEventAccident.isRoadAccident = this.form.controls.isRoadAccident.value;
    personEventAccident.isOnBusinessTravel = this.form.controls.isOnBusinessTravel.value;
    personEventAccident.isTrainingTravel = this.form.controls.isTrainingTravel.value;
    personEventAccident.isTravelToFromWork = this.form.controls.isTravelToFromWork.value;
    personEventAccident.isOnCallout = this.form.controls.isOnCallout.value;
    personEventAccident.isOnStandby = this.form.controls.isOnStandby.value;
    personEventAccident.isPublicRoad = this.form.controls.isPublicRoad.value;
    personEventAccident.isPrivateRoad = this.form.controls.isPrivateRoad.value;

    personEventAccident.vehicleMake = this.form.controls.vehicleMake.value;
    personEventAccident.vehicleRegNo = this.form.controls.vehicleRegNo.value;
    personEventAccident.thirdPartyVehicleMake = this.form.controls.thirdPartyVehicleMake.value;
    personEventAccident.thirdPartyVahicleRegNo = this.form.controls.thirdPartyVahicleRegNo.value;
    personEventAccident.policeReferenceNo = this.form.controls.policeReferenceNo.value;
    personEventAccident.policeStationName = this.form.controls.policeStationName.value;
    return personEventAccident;
  }

  setForm(personEventAccidentDetail: PersonEventAccidentDetail): void {
    if (!this.form) {
      this.createForm(personEventAccidentDetail.personEventId);
    }
  }

  save() {
  }

  isOccurAtNormalWorkplace(event: any) {

  }

  isRoadAccident(event: any) {

  }

  isOnBusinessTravel(event: any) {

  }

  isTrainingTravel(event: any) {

  }

  isTravelToFromWork(event: any) {

  }

  isOnCallout(event: any) {

  }

  isOnStandby(event: any) {

  }

  isPublicRoad(event: any) {

  }

  isPrivateRoad(event: any) {

  }
}
