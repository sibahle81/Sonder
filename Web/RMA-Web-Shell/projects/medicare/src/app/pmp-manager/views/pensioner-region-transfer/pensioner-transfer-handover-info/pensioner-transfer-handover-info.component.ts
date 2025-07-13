import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { isNullOrUndefined } from 'util';
import { PmpRegionTransfer } from '../../../models/pmp-region-transfer';
import { CrudActionType } from 'projects/medicare/src/app/shared/enums/crud-action-type';
import { PMPService } from '../../../services/pmp-service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-pensioner-transfer-handover-info',
  templateUrl: './pensioner-transfer-handover-info.component.html',
  styleUrls: ['./pensioner-transfer-handover-info.component.css']
})
export class PensionerTransferHandoverInfoComponent {

  @Input() passedTransferHandoverInfo: PmpRegionTransfer;
  @Input() title: string = '';
  @Input() isReadOnly: boolean;
  @Input() passedCrudActionType: CrudActionType;
  @Output() transferHandoverInfoEmit = new EventEmitter<PmpRegionTransfer>();

  disabilityDetailsFormGroup: FormGroup;
  isLoading = false;
  nextButtonClicked: boolean = false;
  yesNoInputType = [
    { text: "Yes", value: true },
    { text: "No", value: false }
  ];

  issuedMonthInputType = [
    { text: "One", value: 1 },
    { text: "Three", value: 3 },
    { text: "Six", value: 6 }
  ];
  pensionCaseId: number;
  pensionCaseNumber: string;
  claimId: number;
  pmpRegionTransferId: number;
  crudActionType: CrudActionType
  crudActionTypeEnum = CrudActionType;


  constructor(private formBuilder: FormBuilder, private readonly pmpService: PMPService, private readonly activatedRoute: ActivatedRoute,) {
    this.getRouteData()
    if (isNullOrUndefined(this.passedTransferHandoverInfo))
      this.passedTransferHandoverInfo = new PmpRegionTransfer();
    this.creatForm()
  }


  ngOnInit() {

  }

  creatForm() {

    this.disabilityDetailsFormGroup = this.formBuilder.group({
      dateOfAssessment: [{ value: '', disabled: false }],
      daigonsis: [{ value: '', disabled: false }],
      treatmentReceived: [{ value: '', disabled: false }],
      medicationSundriesIssued: [{ value: '', disabled: false }],
      issuedDate: [{ value: '', disabled: false }],
      isSpousalTraining: [{ value: '', disabled: false }],
      isUDS: [{ value: '', disabled: false }],
      issuedMonth: [{ value: '', disabled: false }],
      drgGroup: [{ value: '', disabled: true }],
    });

  }

  ngOnChanges(changes: SimpleChanges) {

    if (changes?.passedTransferHandoverInfo?.currentValue) {
      this.passedTransferHandoverInfo = changes?.passedTransferHandoverInfo?.currentValue;
      this.prepopulateForm()
    }
    if (changes?.isReadOnly?.currentValue) {
      this.disableForm(changes?.isReadOnly?.currentValue)
    }
    if (changes?.passedCrudActionType?.currentValue) {
      switch (changes?.passedCrudActionType?.currentValue) {
        case CrudActionType.read:
        case CrudActionType.edit:
          this.nextButtonClicked = true;
          break;
        default:
          this.getPensionCaseData()
          this.nextButtonClicked = false;
          break;
      }

    }
  }

  
  getRouteData(){

    this.activatedRoute.params.subscribe((params: any) => {
      if (params.pensionCaseId) {
        this.pensionCaseId = +params.pensionCaseId;
      }
      if (params.pensionCaseNumber) {
        this.pensionCaseNumber = params.pensionCaseNumber;
      }
      if (params.claimId) {
        this.claimId = +params.claimId;
      }
      if (params.pmpRegionTransferId) {
        this.pmpRegionTransferId = +params.pmpRegionTransferId;
      }

      if (params.crudActionType) {
        this.crudActionType = +params.crudActionType;
      }
    });
  }


  onEmitHandoverDetails() {
    this.nextButtonClicked = true;
    this.createTransferHandoverInfoDetails();
    this.transferHandoverInfoEmit.emit(this.passedTransferHandoverInfo);
  }

  createTransferHandoverInfoDetails(): void {
    this.passedTransferHandoverInfo.treatmentReceived = this.disabilityDetailsFormGroup.controls.treatmentReceived.value;
    this.passedTransferHandoverInfo.daigonsis = this.disabilityDetailsFormGroup.controls.daigonsis.value;;
    this.passedTransferHandoverInfo.medicationSundriesIssued = this.disabilityDetailsFormGroup.controls.medicationSundriesIssued.value;
    this.passedTransferHandoverInfo.issuedDate = this.disabilityDetailsFormGroup.controls.issuedDate.value;
    this.passedTransferHandoverInfo.isSpousalTraining = this.disabilityDetailsFormGroup.controls.isSpousalTraining.value;
    this.passedTransferHandoverInfo.isUds = this.disabilityDetailsFormGroup.controls.isUDS.value;
    this.passedTransferHandoverInfo.issuedMonth = this.disabilityDetailsFormGroup.controls.issuedMonth.value;
    this.passedTransferHandoverInfo.comments = this.disabilityDetailsFormGroup.controls.drgGroup.value;
  }

  disableForm(disableVal: boolean) {
    if (disableVal) {
      this.disabilityDetailsFormGroup.disable();
    }
    else {
      this.disabilityDetailsFormGroup.enable();
    }
  }

  prepopulateForm() {
    this.isLoading = false;
    this.disabilityDetailsFormGroup.patchValue({
      dateOfAssessment: this.passedTransferHandoverInfo.createdDate,
      daigonsis: this.passedTransferHandoverInfo.daigonsis,
      treatmentReceived: this.passedTransferHandoverInfo.treatmentReceived,
      medicationSundriesIssued: this.passedTransferHandoverInfo.medicationSundriesIssued,
      issuedDate: this.passedTransferHandoverInfo.issuedDate,
      isSpousalTraining: this.passedTransferHandoverInfo.isSpousalTraining,
      isUDS: this.passedTransferHandoverInfo.isUds,
      issuedMonth: this.passedTransferHandoverInfo.issuedMonth,
      drgGroup: this.passedTransferHandoverInfo.comments,

    });

  }

  getPensionCaseData() {
    this.isLoading = true;
    this.pmpService.searchPensionCase(this.pensionCaseNumber, 0).subscribe(res => {
      this.isLoading = false;
      this.passedTransferHandoverInfo.comments = res.drg;
      this.disabilityDetailsFormGroup.get('drgGroup')?.patchValue(res.drg);
    });
  }

}
