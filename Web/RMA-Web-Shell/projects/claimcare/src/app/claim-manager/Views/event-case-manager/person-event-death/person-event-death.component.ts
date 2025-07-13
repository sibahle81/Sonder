import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { DetailsComponent } from 'projects/shared-components-lib/src/lib/details-component/details-component';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { PersonEventDeathDetailModel } from '../../../shared/entities/personEvent/personEventDeathDetail.model';

@Component({
  selector: 'person-event-death',
  templateUrl: './person-event-death.component.html',
  styleUrls: ['./person-event-death.component.css']
})
export class PersonEventDeathComponent extends DetailsComponent implements OnInit {

  doctorId: number;
  forensicId: number;
  deathtypeId: number;
  undertakerId: number;
  bodyCollectorId: number;
  funeralParlorId: number;

  minDate: Date;
  doctors: any[];
  undertakers: any[];
  bodyCollectors: any[];
  funeralParlors: any[];
  forensicPathologists: any[];

  @Input() isGetPersonEventDeathDetail: number;
  @Output() personEventDeathEmit: EventEmitter<PersonEventDeathDetailModel> = new EventEmitter();

  constructor(
    router: Router,
    appEventsManager: AppEventsManager,
    alertService: AlertService,
    private readonly formBuilder: UntypedFormBuilder, ) {
    super(appEventsManager, alertService, router, '', '', 0);
  }

  ngOnInit() {
    this.createForm('');
  }

  ngAfterViewInit(): void {
    if (this.isGetPersonEventDeathDetail === 1) {
      this.personEventDeathEmit.emit(this.readForm());
    }
  }

  createForm(id: any): void {
    this.form = this.formBuilder.group({
      id,
      deathType: ['', [Validators.required]],
      dHAReferenceNo: '',
      deathCertificateNo: '',
      interviewWithFamilyMemeber: '',
      medicalPractitionerOpinion: '',
      deathDate: ['', [Validators.required]],
      postMortemDate: ['', [Validators.required]],
      postMortemNumber: '',
      bodyNumber: '',
      homeAffairsRegion: '',
      placeOfDeath: '',
      sapsCaseNumber: '',
      bodyCollector: '',
      undertaker: '',
      funeralParlor: '',
      doctor: '',
      forensicPathologist: ''
    });
  }

  deathTypeChanged(event: any) {
    this.deathtypeId = event.value as number;
  }

  bodyCollectorChanged(event: any) {
    this.bodyCollectorId = event.value as number;
  }

  undertakerChanged(event: any) {
    this.undertakerId = event.value as number;
  }

  funeralParlorChanged(event: any) {
    this.funeralParlorId = event.value as number;
  }

  doctorChanged(event: any) {
    this.doctorId = event.value as number;
  }

  forensicPathologistChanged(event: any) {
    this.forensicId = event.value as number;
  }

  readForm(): PersonEventDeathDetailModel {
    const personEventDeath = new PersonEventDeathDetailModel();
    const newDeathDate = new Date(this.form.controls.deathDate.value);
    const deathDate = new Date(newDeathDate.setDate(newDeathDate.getDate() + 1));
    const newPostMortemDate = new Date(this.form.controls.postMortemDate.value);
    const postMortemDate = new Date(newPostMortemDate.setDate(newPostMortemDate.getDate() + 1));
    personEventDeath.deathTypeId = this.deathtypeId;
    personEventDeath.dhaReferenceNo = this.form.controls.dHAReferenceNo.value;
    personEventDeath.deathCertificateNo = this.form.controls.deathCertificateNo.value;
    personEventDeath.interviewWithFamilyMember = this.form.controls.interviewWithFamilyMemeber.value;
    personEventDeath.opinionOfMedicalPractitioner = this.form.controls.medicalPractitionerOpinion.value;
    personEventDeath.deathDate = deathDate;
    personEventDeath.dateOfPostmortem = postMortemDate
    personEventDeath.postMortemNumber = this.form.controls.postMortemNumber.value;
    personEventDeath.homeAffairsRegion = this.form.controls.homeAffairsRegion.value;

    personEventDeath.interviewWithFamilyMember = true;
    personEventDeath.opinionOfMedicalPractitioner = false;

    personEventDeath.placeOfDeath = this.form.controls.placeOfDeath.value;
    personEventDeath.sapCaseNumber = this.form.controls.sapsCaseNumber.value;
    personEventDeath.bodyCollectorId = this.bodyCollectorId;
    personEventDeath.underTakerId = this.undertakerId;
    personEventDeath.funeralParlorId = this.funeralParlorId;
    personEventDeath.doctorId = this.doctorId;
    personEventDeath.forensicPathologistId = this.forensicId;

    return personEventDeath;
  }

  setForm(personEventDeathDetail: PersonEventDeathDetailModel): void {
    this.form.controls.deathType.setValue(personEventDeathDetail.deathTypeId);
    this.form.controls.dHAReferenceNo.setValue(personEventDeathDetail.dhaReferenceNo);
    this.form.controls.deathCertificateNo.setValue(personEventDeathDetail.deathCertificateNo);
    this.form.controls.deathDate.setValue(personEventDeathDetail.deathDate);
    this.form.controls.postMortemDate.setValue(personEventDeathDetail.dateOfPostmortem);
    this.form.controls.postMortemNumber.setValue(personEventDeathDetail.postMortemNumber);
    this.form.controls.bodyNumber.setValue(personEventDeathDetail.bodyNumber);
    this.form.controls.homeAffairsRegion.setValue(personEventDeathDetail.homeAffairsRegion);
    this.form.controls.placeOfDeath.setValue(personEventDeathDetail.placeOfDeath);
    this.form.controls.sapsCaseNumber.setValue(personEventDeathDetail.sapCaseNumber);
    this.form.controls.bodyCollector.setValue(personEventDeathDetail.bodyCollectorId);
    this.form.controls.undertaker.setValue(personEventDeathDetail.underTakerId);
    this.form.controls.funeralParlor.setValue(personEventDeathDetail.funeralParlorId);
    this.form.controls.doctor.setValue(personEventDeathDetail.doctorId);
    this.form.controls.forensicPathologist.setValue(personEventDeathDetail.forensicPathologistId);
    this.form.disable();
  }

  save() {
  }
}
