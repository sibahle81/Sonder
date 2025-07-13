import { Component, Inject, Input, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { BehaviorSubject, merge } from 'rxjs';
import { MedicalSwitchBatchSearchPersonEvent } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-switch-batch-search-person-event';
import { DatePipe } from '@angular/common';
import { MedicareMedicalInvoiceSwitchBatchService } from 'projects/medicare/src/app/medical-invoice-manager/services/medicare-medical-invoice-switch-batch.service';
import { PersonEventSearchNavigationEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/person-event-search-navigation.enum';
import { MedicalInvoiceClaimService } from 'projects/medicare/src/app/medical-invoice-manager/services/medical-invoice-claim.service';
import { isNullOrUndefined } from 'util';
import { NationalityEnum } from 'projects/shared-models-lib/src/lib/enums/nationality-enum';
import { SwitchBatchType } from '../../../shared/enums/switch-batch-type';

@Component({
  selector: 'app-invoice-switch-batch-search-pev',
  templateUrl: './invoice-switch-batch-search-pev.component.html',
  styleUrls: ['./invoice-switch-batch-search-pev.component.css']
})
export class InvoiceSwitchBatchSearchPevModalComponent implements OnInit {

  personEventSearchNavigationEnum = PersonEventSearchNavigationEnum;
  nationalityEnum = NationalityEnum;
  @Input() searchPersonEventFormVisibleState: number = this.personEventSearchNavigationEnum.ShowOption;
  loading$ = new BehaviorSubject<boolean>(false);
  invoiceData: any;
  searchPersonEventForm: UntypedFormGroup;
  medicalSwitchBatchSearchPersonEvent: MedicalSwitchBatchSearchPersonEvent;
  selectedPersonEventSearchResultsData: any;
  personEventResultsTableData: any;
  startWizardBatchSelectedDataSend: any;
  nationality = [];
  medicalSwitchBatchSearchPersonEventParams: MedicalSwitchBatchSearchPersonEvent;
  switchBatchType: SwitchBatchType = SwitchBatchType.MedEDI;//default val used if not set/passed

  constructor(private readonly formBuilder: UntypedFormBuilder,
    public readonly datepipe: DatePipe,
    readonly confirmservice: ConfirmationDialogsService,
    @Inject(MAT_DIALOG_DATA) public invoiceDataClicked: any) {
    this.invoiceData = invoiceDataClicked.invoiceDataClicked;
    this.switchBatchType = invoiceDataClicked.switchBatchType;
  }

  ngOnInit() {
    this.createForm();
    this.nationalityData()
  }

  nationalityData() {
    for (var name in this.nationalityEnum) {
      if (isNaN(Number(name))) {
        this.nationality.push(name);
      }
    }
  }

  createForm(): void {
    this.searchPersonEventForm = this.formBuilder.group({
      industryNumber: [''],
      coEmployeeNo: [''],
      surname: [''],
      pensionNumber: [''],
      fullFirstName: [''],
      passPortNumber: [''],
      initials: [''],
      passportNationality: [''],
      idNumber: [''],
      eventId: [''],
      otherIdentification: [''],
      mainClaimRefNo: [''],
      dateOfBirth: [''],
      dateOfEvent: ['']
    });
  }

  onResetAllFormFields() {
    this.searchPersonEventForm.reset();
  }

  onSearchPersonEvent() {

    this.loading$.next(false)

    this.medicalSwitchBatchSearchPersonEventParams = {
      industryNumber: (!isNullOrUndefined(this.searchPersonEventForm.value.industryNumber)) ? this.searchPersonEventForm.value.industryNumber : "",
      coEmployeeNo: (!isNullOrUndefined(this.searchPersonEventForm.value.coEmployeeNo)) ? this.searchPersonEventForm.value.coEmployeeNo : "",
      surname: (!isNullOrUndefined(this.searchPersonEventForm.value.surname)) ? this.searchPersonEventForm.value.surname : "",
      pensionNumber: (!isNullOrUndefined(this.searchPersonEventForm.value.pensionNumber)) ? this.searchPersonEventForm.value.pensionNumber : "",
      fullFirstName: (!isNullOrUndefined(this.searchPersonEventForm.value.fullFirstName)) ? this.searchPersonEventForm.value.fullFirstName : "",
      passPortNumber: (!isNullOrUndefined(this.searchPersonEventForm.value.passPortNumber)) ? this.searchPersonEventForm.value.passPortNumber : "",
      initials: (!isNullOrUndefined(this.searchPersonEventForm.value.initials)) ? this.searchPersonEventForm.value.initials : "",
      passportNationality: (!isNullOrUndefined(this.searchPersonEventForm.value.passportNationality) && this.searchPersonEventForm.value.passportNationality != "") ? Number(this.nationalityEnum[this.searchPersonEventForm.value.passportNationality]) : 0,
      idNumber: (!isNullOrUndefined(this.searchPersonEventForm.value.idNumber)) ? this.searchPersonEventForm.value.idNumber : "",
      eventId: (this.searchPersonEventForm.value.eventId > 0) ? this.searchPersonEventForm.value.eventId : 0,
      personEventId: 0,
      claimId: 0,
      claimReferenceNumber: "",
      otherIdentification: (!isNullOrUndefined(this.searchPersonEventForm.value.otherIdentification)) ? this.searchPersonEventForm.value.otherIdentification : "",
      mainClaimRefNo: (!isNullOrUndefined(this.searchPersonEventForm.value.mainClaimRefNo)) ? this.searchPersonEventForm.value.mainClaimRefNo : "",
      dateOfBirth: (this.searchPersonEventForm.value.dateOfBirth != "") && (!isNullOrUndefined(this.searchPersonEventForm.value.dateOfBirth)) ? this.datepipe.transform(this.searchPersonEventForm.value.dateOfBirth, 'yyyy-MM-dd')
        : this.datepipe.transform("", 'yyyy-MM-dd'),
      dateOfEvent: (this.searchPersonEventForm.value.dateOfEvent != "") && (!isNullOrUndefined(this.searchPersonEventForm.value.dateOfEvent)) ? this.datepipe.transform(this.searchPersonEventForm.value.dateOfEvent, 'yyyy-MM-dd')
        : this.datepipe.transform("", 'yyyy-MM-dd'),
      eventDescription: "",
      accidentDetailPersonEventId: 0,
      isFatal: false
    }

    this.personEventResultsTableData = this.medicalSwitchBatchSearchPersonEventParams;
    //output this.invoiceData to details component - this is batch selected record
    this.selectedPersonEventSearchResultsData = null;
    this.startWizardBatchSelectedDataSend = this.invoiceData;
    this.searchPersonEventFormVisibleState = this.personEventSearchNavigationEnum.HideOption;

  }

  receiveselectedPersonEventSearchResults($event) {
    this.selectedPersonEventSearchResultsData = $event;
  }

  receivenewSearchQueryResults($event) {
    this.searchPersonEventFormVisibleState = $event;
  }

  receiveformSearchControlVisibleStateResults($event) {
    this.searchPersonEventFormVisibleState = $event;
  }

  receiveSearchPersonEventFormVisibleState($event) {
    this.personEventResultsTableData = $event;
  }

}
