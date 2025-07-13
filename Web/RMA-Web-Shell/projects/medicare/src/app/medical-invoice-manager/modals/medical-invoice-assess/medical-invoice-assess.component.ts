import { Component, OnInit, Inject, Input, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ErrorStateMatcher } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MedicalInvoicesList } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-list';
import { MedicalInvoiceLineItem } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-line-item';
import { InvoiceStatusEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/invoice-status.enum';
import { PayeeTypeEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/payee-type.enum';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { InvoiceLineDetails } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-line-details';
import { InvoiceAssessDynamicLines } from 'projects/medicare/src/app/medical-invoice-manager/modals/medical-invoice-assess/invoice-assess-dynamic-lines';
import { InvoiceDetails } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-details';
import { PaymentMethodEnum } from 'projects/shared-models-lib/src/lib/enums/payment-method-enum';
import { ClaimInvoiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-invoice-type-enum';
import { MedicalmedicalInvoiceAssessService } from 'projects/medicare/src/app/medical-invoice-manager/services/medicalmedical-invoice-assess.service';
import { ClaimInvoiceAllocationStatusEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/invoice-allocation-status.enum';
import { AssessIncludeExcludeLineEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/assess-include-exclude-line.enum';
import { InvoiceUnderAssessReason } from 'projects/medicare/src/app/medical-invoice-manager/models/invoice-under-assess-reason';
import { Invoice } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice';
import { InvoiceLineUnderAssessReason } from 'projects/medicare/src/app/medical-invoice-manager/models/invoice-line-under-assess-reason';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { KeyRoleEnum } from 'projects/shared-models-lib/src/lib/enums/key-role-enum';
import { RuleRequestResult } from 'projects/shared-components-lib/src/lib/rules-engine/shared/models/rule-request-result';
import { MedicalInvoiceClaimService } from 'projects/medicare/src/app/medical-invoice-manager/services/medical-invoice-claim.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { MedicalInvoicePaymentAllocation } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-payment-allocation';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { MedicareMedicalInvoiceCommonService } from '../../services/medicare-medical-invoice-common.service';
import { PaymentAllocationStatusEnum } from 'projects/fincare/src/app/shared/enum/payment-allocation-status-enum';
import { PaymentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/payment-type-enum';
import { MedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/medical-report-form';
import { EventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/event.model';
import { isNullOrUndefined } from 'util';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { PersonEventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/personEvent.model';
import { TebaInvoice } from '../../models/teba-invoice';
import { InvoiceAssessAllocateData } from '../../models/medical-invoice-assess-allocate-data';
import { MedicareUtilities } from '../../../shared/medicare-utilities';
import { SwitchBatchType } from '../../../shared/enums/switch-batch-type';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';

@Component({
  selector: 'app-medical-invoice-assess',
  templateUrl: './medical-invoice-assess.component.html',
  styleUrls: ['./medical-invoice-assess.component.css']
})
export class MedicalInvoiceAssessModalComponent implements OnInit {

  @Input() invoiceData: any;
  invoiceDataSelected: InvoiceDetails;
  switchBatchType: SwitchBatchType;
  switchBatchTypeEnum = SwitchBatchType
  paymentMethodEnum = PaymentMethodEnum;
  claimInvoiceTypeEnum = ClaimInvoiceTypeEnum;
  invoiceAllocationStatusEnum = ClaimInvoiceAllocationStatusEnum;
  AssessIncludeExcludeLineEnum = AssessIncludeExcludeLineEnum;
  medicalInvoiceAssessForm: UntypedFormGroup;
  matcher = new MyErrorStateMatcher();
  //for assigning lines as formArray
  allocationInvoiceLines
  lineItemsTotal: number = 0;
  counter: number = 0;
  isLoading = false;
  private assessAllocationSubmitSubcription: Subscription;
  medicalReportList: MedicalReportForm[] = [];
  loadingClaimsData$ = new BehaviorSubject<boolean>(false);
  selectedEvent: EventModel;
  personEventId: number;
  selectedPersonEvent: PersonEventModel;
  payeeName: string;
  rolePlayerDetails: RolePlayer;
  loadingPayee$ = new BehaviorSubject<boolean>(false);

  constructor(private readonly formBuilder: UntypedFormBuilder,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private readonly alertService: AlertService,
    readonly confirmservice: ConfirmationDialogsService,
    private readonly authService: AuthService,
    private readonly medicareMedicalInvoiceCommonService: MedicareMedicalInvoiceCommonService,
    private medicalmedicalInvoiceAssessService: MedicalmedicalInvoiceAssessService,
    private roleplayerService: RolePlayerService,
    private readonly medicalInvoiceClaimService: MedicalInvoiceClaimService,
    private ref: ChangeDetectorRef,
    private _formBuilder: UntypedFormBuilder,
    private readonly eventService: ClaimCareService,
    public dialogRef: MatDialogRef<MedicalInvoiceAssessModalComponent>,
    @Inject(MAT_DIALOG_DATA) public invoiceDataClicked: any) {
    this.invoiceDataSelected = invoiceDataClicked.invoiceDataClicked;
    this.switchBatchType = invoiceDataClicked.switchBatchTypePassed
  }

  currentUrl = this.router.url;

  public invoiceStatusEnum: typeof InvoiceStatusEnum = InvoiceStatusEnum;
  public payeeTypeEnum: typeof PayeeTypeEnum = PayeeTypeEnum;

  invoiceLineItems: InvoiceLineDetails[] = [];
  invoiceLineItemsAssesssed: InvoiceLineDetails[] = [];
  resolvedData: MedicalInvoicesList[];
  hcpRolePlayerId: number;
  invoiceLineDetails: InvoiceLineDetails[] = [];
  dataSource = new MatTableDataSource<InvoiceLineDetails>(this.invoiceLineDetails);

  invoiceWithLineItems: Invoice

  getDisplayedColumns(): string[] {
    let columnDefinitions = [
      { def: 'description', hide: false },
      { def: 'hcpTariffCode', hide: false },
      { def: 'serviceDate', hide: false },
      { def: 'serviceTimeStart', hide: this.switchBatchType == SwitchBatchType.Teba },
      { def: 'serviceTimeEnd', hide: this.switchBatchType == SwitchBatchType.Teba },
      { def: 'requestedAmountInclusive', hide: false },
      { def: 'requestedVat', hide: true },
      { def: 'authorisedAmountInclusive', hide: false },
      { def: 'authorisedQuantity', hide: false },
      { def: 'authorisedVat', hide: false },
      { def: 'exclude', hide: false },
      { def: 'underAssessReason', hide: false },
      { def: 'include', hide: false },
      { def: 'tariffAmount', hide: false },
      { def: 'requestedQuantity', hide: false },
      { def: 'defaultQuantity', hide: false },
      { def: 'authorisedAmount', hide: true }
    ]
    return columnDefinitions.filter(cd => !cd.hide).map(cd => cd.def);
  }

  ngOnInit() {
    this.invoiceLineItems = this.invoiceDataSelected.invoiceLineDetails;
    
    this.dataSource = new MatTableDataSource<InvoiceLineDetails>(this.invoiceLineItems);
    //create form array with empty as lineitems are not yet set
    this.medicalInvoiceAssessForm = this._formBuilder.group({
      allocationLines: this._formBuilder.array([])
    });
    // asFormGroup is structure for form array 
    const formGroupControls = this.invoiceLineItems.map(InvoiceAssessDynamicLines.asFormGroup);
    //getting data object with properties to be used for table rows
    this.allocationInvoiceLines = new UntypedFormArray(formGroupControls);
    //setting recieved object as array into form array controls
    this.medicalInvoiceAssessForm.setControl('allocationLines', this.allocationInvoiceLines);

    //default formArray length
    this.lineItemsTotal = this.medicalInvoiceAssessForm.value.allocationLines.length;
    let formArray = this.medicalInvoiceAssessForm.get("allocationLines") as UntypedFormArray;

    for (let i = 0; i < this.medicalInvoiceAssessForm.value.allocationLines.length; i++) {

      let invoiceAmounInclTotal = this.invoiceLineItems[i].requestedAmountInclusive
      let invoiceQuantity = this.invoiceLineItems[i].requestedQuantity
      let tarrifAmountTotal = this.invoiceLineItems[i].totalTariffAmountInclusive
      let tarrifVatAmount = this.invoiceLineItems[i].totalTariffVat
      let invoiceLineVatAmount = this.invoiceLineItems[i].requestedVat
      let lineInclTotal = this.calculateLineTotalFromTariffAndUnitAmount(tarrifAmountTotal, tarrifVatAmount, invoiceQuantity);
      let lessDefaultTotal = this.getDefaultAssessAmountValue(invoiceAmounInclTotal, lineInclTotal);
      formArray.at(i).get('authorisedAmountInclusive').patchValue(lessDefaultTotal);
      formArray.at(i).get('authorisedQuantity').patchValue(invoiceQuantity);
      let vatLinePercentage = this.invoiceLineItems[i].vatPercentage
      let invoiceLineAmounExclTotal = this.invoiceLineItems[i].requestedAmountInclusive
      let defaultRequestedVat = lessDefaultTotal != invoiceAmounInclTotal? tarrifVatAmount : invoiceLineVatAmount;
      formArray.at(i).get('authorisedVat').patchValue(defaultRequestedVat);
    }

    this.start()

    this.personEventId = !isNullOrUndefined(this.invoiceDataSelected?.personEventId) ? this.invoiceDataSelected?.personEventId : 0;
    this.getEvent(this.personEventId);
    if (this.switchBatchType == SwitchBatchType.MedEDI)
      this.getMedicalReportDetails()
  }

  get allocationLines(): UntypedFormArray {
    return this.medicalInvoiceAssessForm.get('allocationLines') as UntypedFormArray;
  }

  calculateLineTotalFromTariffAndUnitAmount(totalTariffAmountInclusive: number, totalTariffVat, requestedQuantity: number): number {
    //system tarrif and invoice quantity
    let total = +(totalTariffAmountInclusive * requestedQuantity).toFixed(2);
    return total;
  }

  getDefaultAssessAmountValue(invoiceLineTotalAmount: number, lineTariffAmount: number): number {
    //system totalTariffAmountInclusive and requestedAmountInclusive
    let defaultTotal = (invoiceLineTotalAmount > lineTariffAmount) ? lineTariffAmount : invoiceLineTotalAmount;
    return defaultTotal;
  }

  onValueChangeRecalculateVat(element, $event, i) {
    let formArray = this.medicalInvoiceAssessForm.get("allocationLines") as UntypedFormArray;
    let lineVat = this.onReCalculateVatFromVatPercentageHealthCareProvider(this.invoiceLineItems[i].vatPercentage, element.value.authorisedAmountInclusive);
    formArray.at(i).get('authorisedVat').patchValue(lineVat);
    formArray.at(i).get('authorisedVat').clearValidators();
    formArray.at(i).get('authorisedVat').updateValueAndValidity(); 
  }

  onQuantityChange(element, $event, i) {
    let formArray = this.medicalInvoiceAssessForm.get("allocationLines") as UntypedFormArray;
    if (element.value.authorisedQuantity > 0) {
      //calculated amounts
      let authorisedUnitAmount = element.value.authorisedAmountInclusive / element.value.authorisedQuantity;
      let newCalculatedAmount = +(authorisedUnitAmount * element.value.authorisedQuantity).toFixed(2);
      let lineAmount = (element.value.authorisedQuantity > 0) ? newCalculatedAmount : element.value.authorisedAmountInclusive;
      let invoiceQuantity = (element.value.authorisedQuantity > 0) ? element.value.authorisedQuantity : 1;
      formArray.at(i).get('authorisedAmountInclusive').patchValue(lineAmount);
      formArray.at(i).get('authorisedQuantity').patchValue(invoiceQuantity);
      let lineVat = this.onReCalculateVatFromVatPercentageHealthCareProvider(this.invoiceLineItems[i].vatPercentage, newCalculatedAmount);
      formArray.at(i).get('authorisedVat').patchValue(lineVat);
    }
    else {
      //default to initial amounts - requested
      formArray.at(i).get('authorisedAmountInclusive').patchValue(this.invoiceLineItems[i].requestedAmountInclusive);
      formArray.at(i).get('authorisedQuantity').patchValue(this.invoiceLineItems[i].requestedQuantity);
      formArray.at(i).get('authorisedVat').patchValue(this.invoiceLineItems[i].requestedVat);
    }
    
    formArray.at(i).get('authorisedAmountInclusive').clearValidators();
    formArray.at(i).get('authorisedVat').clearValidators();
    formArray.at(i).get('authorisedAmountInclusive').updateValueAndValidity();
    formArray.at(i).get('authorisedVat').updateValueAndValidity();
  }

  onReCalculateVatFromVatPercentageHealthCareProvider(vatPercentage, amount): number {
    let vatAmount = +(amount * vatPercentage / 100).toFixed(2);
    return vatAmount;
  }

  includePrevoiseState: boolean[] = new Array(this.lineItemsTotal);
  excludePrevoiseState: boolean[] = new Array(this.lineItemsTotal);

  onSelectedRadioLineItem(itemIndexNumber, IncludeExcludeState) {
    this.medicalInvoiceAssessForm.value.allocationLines[itemIndexNumber].include = (IncludeExcludeState == this.AssessIncludeExcludeLineEnum[1]) ? true : false;
    this.medicalInvoiceAssessForm.value.allocationLines[itemIndexNumber].exclude = (IncludeExcludeState == this.AssessIncludeExcludeLineEnum[2]) ? true : false;

    this.includePrevoiseState[itemIndexNumber] = (IncludeExcludeState == this.AssessIncludeExcludeLineEnum[1]) ? true : false;
    this.excludePrevoiseState[itemIndexNumber] = (IncludeExcludeState == this.AssessIncludeExcludeLineEnum[2]) ? true : false;

    this.checkReasonProvided();
    this.checkAssessAmountAndQuantityProvided();

  }

  onChangeAssessValueLineItem($event, index) {
    for (let i = 0; i < this.medicalInvoiceAssessForm.value.allocationLines.length; i++) {
      this.medicalInvoiceAssessForm.value.allocationLines[i].include = this.includePrevoiseState[i];
      this.medicalInvoiceAssessForm.value.allocationLines[i].exclude = this.excludePrevoiseState[i];

    }

  }

  start() {
    if (this.counter < 1) {
      this.counter += 1;
      for (let i = 0; i < this.medicalInvoiceAssessForm.value.allocationLines.length; i++) {
        this.medicalInvoiceAssessForm.value.allocationLines[i].include = this.includePrevoiseState[i];
        this.medicalInvoiceAssessForm.value.allocationLines[i].exclude = this.excludePrevoiseState[i];

      }
    }
    this.medicalInvoiceAssessForm.statusChanges.subscribe(a => {
      this.onChangeAssessValueLineItem(a, a)
    });


    this.roleplayerService.SearchRolePlayerByRegistrationNumber(KeyRoleEnum.MedicalServiceProvider, this.invoiceDataSelected.practiceNumber).subscribe(
      rolePlayerDetails => {
        this.hcpRolePlayerId = rolePlayerDetails.rolePlayerId
      });
  }

  onCancel() {

  }

  onReset() {
    this.medicalInvoiceAssessForm.reset();
    this.ngOnInit()
  }

  checkTariffAndAllocatedAmount(value, index, array): boolean {
    let testLines = [];
    let pass: boolean = false;
    for (let i = 0; i < array.length; i++) {
      if (array[i].authorisedAmountInclusive > array[i].tariffAmount * array[i].requestedQuantity) {
        pass = true;
      }
      else {
        pass = false;
      }
      testLines.push(pass);
    }

    let includeFalse = testLines.includes(true);
    return !includeFalse
  }

  checkIncludeExclude(value, index, array): boolean {
    let testLines = [];
    let pass: boolean = false;
    for (let i = 0; i < array.length; i++) {
      if (array[i].include || array[i].exclude) {
        pass = true;
      }
      else {
        pass = false;
      }
      testLines.push(pass);
    }

    let includeFalse = testLines.includes(false);
    return !includeFalse
  }

  checkReasonProvided() {
    let formArrayGroupItems: any;
    formArrayGroupItems = (this.medicalInvoiceAssessForm.get("allocationLines") as UntypedFormArray).controls;
    for (let item of formArrayGroupItems) {
      if (item.value.exclude && item.value.underAssessReason == "") {
        item.controls["underAssessReason"].setValidators([Validators.required, Validators.min(3)]);
      }
      else {
        item.controls["underAssessReason"].clearValidators();
      }
      item.controls["underAssessReason"].updateValueAndValidity();
    }
  }

  checkAssessAmountAndQuantityProvided() {
    let formArrayGroupItems: any;
    formArrayGroupItems = (this.medicalInvoiceAssessForm.get("allocationLines") as UntypedFormArray).controls;
    for (let item of formArrayGroupItems) {
      if (!item.value.exclude) {
        item.controls["authorisedAmountInclusive"].setValidators([Validators.required, Validators.min(1), Validators.max(Number(this.invoiceDataSelected.invoiceTotalInclusive))]);
        item.controls["authorisedQuantity"].setValidators([Validators.required, Validators.min(1/2)]);
      }
      else {
        item.controls["authorisedAmountInclusive"].clearValidators();
        item.controls["authorisedQuantity"].clearValidators();
      }
      item.controls["authorisedAmountInclusive"].updateValueAndValidity();
      item.controls["authorisedQuantity"].updateValueAndValidity();
    }
  }

  percentAllocation(assessedAmount, invoiceTotalInclusive): number {
    let totalPercentage = 100;
    let Difference = Math.abs(assessedAmount - invoiceTotalInclusive);
    let percentageDifference = Difference / invoiceTotalInclusive * 100;
    totalPercentage = totalPercentage - percentageDifference;
    return Number(totalPercentage.toFixed(0));
  }

  invoiceUnderAssessReason: InvoiceUnderAssessReason[] = [];
  invoiceLineUnderAssessReason: InvoiceLineUnderAssessReason[] = [];
  medicalInvoiceLineItem: MedicalInvoiceLineItem[] = [];
  authorisedAmount: number = 0;
  authorisedVat: number = 0;
  authorisedTotalInclusive: number = 0;
  allocationRulesResults: RuleRequestResult = {
    requestId: '',
    overallSuccess: false,
    ruleResults: []
  }

  onAllocateSubmit(medicalInvoiceAssessForm) {
    this.isLoading = true;

    if (medicalInvoiceAssessForm.value.allocationLines.every(this.checkIncludeExclude) && medicalInvoiceAssessForm.controls.allocationLines.valid) {
      //if above pass then check if line amount does not exceed tarrif amount
      if (medicalInvoiceAssessForm.value.allocationLines.every(this.checkTariffAndAllocatedAmount)) {

        let invoiceId = this.invoiceDataSelected.invoiceId;

        let assessedAmount = 0;
        let assessedVat = 0;
        let assessedQuantity = 0;
        let includeState = false;
        for (let i = 0; i < medicalInvoiceAssessForm.value.allocationLines.length; i++) {
          includeState = medicalInvoiceAssessForm.value.allocationLines[i].include;

          let authorisedAmountIncl = (includeState) ? +(medicalInvoiceAssessForm.value.allocationLines[i].authorisedAmountInclusive).toFixed(2) : 0;
          let authorisedVat = (includeState) ? +(medicalInvoiceAssessForm.value.allocationLines[i].requestedVat).toFixed(2) : 0;
          let authorisedQuantity = (includeState) ? +(medicalInvoiceAssessForm.value.allocationLines[i].authorisedQuantity).toFixed(2) : 1;
          assessedAmount += Number((authorisedAmountIncl - authorisedVat).toFixed(2));
          assessedVat += authorisedVat;
          assessedQuantity += authorisedQuantity;
        }

       
          let invoiceAllocations = new MedicalInvoicePaymentAllocation();
          invoiceAllocations.payeeId = this.hcpRolePlayerId;
          invoiceAllocations.paymentAllocationStatus =  PaymentAllocationStatusEnum.PaymentRequested;
          invoiceAllocations.medicalInvoiceId = invoiceId;
          invoiceAllocations.assessedAmount = assessedAmount;
          invoiceAllocations.assessedVat = assessedVat;
          invoiceAllocations.paymentType = (this.switchBatchType == SwitchBatchType.MedEDI) ? PaymentTypeEnum.MedicalInvoice : PaymentTypeEnum.TebaInvoice;

          this.medicalInvoiceLineItem = [];

          let invoiceUnderAssessReasonData = new InvoiceUnderAssessReason();
          invoiceUnderAssessReasonData.invoiceId = invoiceId;
          invoiceUnderAssessReasonData.underAssessReasonId = 100;
          invoiceUnderAssessReasonData.underAssessReason = "";
          invoiceUnderAssessReasonData.comments = "Invoice Assessed manually by:"+this.authService.getUserEmail();
          this.invoiceUnderAssessReason.push(invoiceUnderAssessReasonData);

          for (let i = 0; i < medicalInvoiceAssessForm.value.allocationLines.length; i++) {

            let invoiceLineUnderAssessReasonData = new InvoiceLineUnderAssessReason();
            invoiceLineUnderAssessReasonData.invoiceLineId = invoiceId;
            invoiceLineUnderAssessReasonData.underAssessReasonId = 100;
            invoiceLineUnderAssessReasonData.underAssessReason = "";
            invoiceLineUnderAssessReasonData.comments = medicalInvoiceAssessForm.value.allocationLines[i].underAssessReason + "-comment";
            this.invoiceLineUnderAssessReason.push(invoiceLineUnderAssessReasonData);

            includeState = medicalInvoiceAssessForm.value.allocationLines[i].include;

            let invoiceLineItem = {
              invoiceLineId: this.invoiceLineItems[i].invoiceLineId,
              invoiceId: invoiceId,
              serviceDate: this.invoiceLineItems[i].serviceDate,
              serviceTimeStart: this.invoiceLineItems[i].serviceTimeStart,
              serviceTimeEnd: this.invoiceLineItems[i].serviceTimeEnd,
              requestedQuantity: this.invoiceLineItems[i].requestedQuantity,
              requestedAmount: this.invoiceLineItems[i].requestedAmount,
              requestedVat: this.invoiceLineItems[i].requestedVat,
              requestedAmountInclusive: this.invoiceLineItems[i].requestedAmountInclusive,
              //===lines adjusted assessed amount or zero if line exluded
              authorisedQuantity: (includeState) ? parseFloat(medicalInvoiceAssessForm.value.allocationLines[i].authorisedQuantity) : 1,//quantity authorised from number box
              authorisedAmount: (includeState) ? parseFloat(Number(parseFloat(medicalInvoiceAssessForm.value.allocationLines[i].authorisedAmountInclusive.toFixed(2)) - (
                parseFloat(medicalInvoiceAssessForm.value.allocationLines[i].authorisedVat.toFixed(2)))).toFixed(2)) : 0,
              authorisedVat: (includeState) ? +((parseFloat(medicalInvoiceAssessForm.value.allocationLines[i].authorisedAmountInclusive.toFixed(2))) *
              this.invoiceLineItems[i].vatPercentage / 100).toFixed(2) : 0,
              authorisedAmountInclusive: (includeState) ? parseFloat(medicalInvoiceAssessForm.value.allocationLines[i].authorisedAmountInclusive.toFixed(2)) *
              parseFloat(medicalInvoiceAssessForm.value.allocationLines[i].authorisedQuantity) : 0,
              totalTariffAmount: this.invoiceLineItems[i].totalTariffAmount,
              totalTariffVat: this.invoiceLineItems[i].totalTariffVat,
              totalTariffAmountInclusive: this.invoiceLineItems[i].totalTariffAmountInclusive,
              tariffAmount: this.invoiceLineItems[i].tariffAmount,
              creditAmount: this.invoiceLineItems[i].creditAmount,
              vatCode: this.invoiceLineItems[i].vatCode,
              vatPercentage: this.invoiceLineItems[i].vatPercentage,
              tariffId: this.invoiceLineItems[i].tariffId,
              treatmentCodeId: this.invoiceLineItems[i].treatmentCodeId,
              medicalItemId: this.invoiceLineItems[i].medicalItemId,
              hcpTariffCode: this.invoiceLineItems[i].hcpTariffCode,
              tariffBaseUnitCostTypeId: this.invoiceLineItems[i].tariffBaseUnitCostTypeId,
              description: this.invoiceLineItems[i].description,
              summaryInvoiceLineId: this.invoiceLineItems[i].summaryInvoiceLineId,
              isPerDiemCharge: this.invoiceLineItems[i].isPerDiemCharge,
              isDuplicate: this.invoiceLineItems[i].isDuplicate,
              duplicateInvoiceLineId: this.invoiceLineItems[i].duplicateInvoiceLineId,
              calculateOperands: this.invoiceLineItems[i].calculateOperands,
              icd10Code: this.invoiceLineItems[i].icd10Code,
              invoiceLineUnderAssessReasons: this.invoiceLineUnderAssessReason
            }

            //totals for header
            this.authorisedAmount += invoiceLineItem.authorisedAmount;
            this.authorisedVat += invoiceLineItem.authorisedVat;
            this.authorisedTotalInclusive += invoiceLineItem.authorisedAmountInclusive;

            let invoiceLineItemData = invoiceLineItem as MedicalInvoiceLineItem
            this.medicalInvoiceLineItem.push(invoiceLineItemData);
          }

          let invoiceWithLineItems = {
            invoiceId: invoiceId,
            claimId: this.invoiceDataSelected.claimId,
            personEventId: this.invoiceDataSelected.personEventId,
            healthCareProviderId: this.invoiceDataSelected.healthCareProviderId,
            hcpInvoiceNumber: this.invoiceDataSelected.hcpInvoiceNumber,
            hcpAccountNumber: this.invoiceDataSelected.hcpAccountNumber,
            invoiceNumber: this.invoiceDataSelected.invoiceNumber,
            invoiceDate: this.invoiceDataSelected.invoiceDate,
            dateSubmitted: this.invoiceDataSelected.dateSubmitted,
            dateReceived: this.invoiceDataSelected.dateReceived,
            dateAdmitted: this.invoiceDataSelected.dateAdmitted,
            dateDischarged: this.invoiceDataSelected.dateDischarged,
            invoiceStatus: this.invoiceDataSelected.invoiceStatus,
            invoiceAmount: this.invoiceDataSelected.invoiceAmount,
            invoiceVat: this.invoiceDataSelected.invoiceVat,
            invoiceTotalInclusive: this.invoiceDataSelected.invoiceTotalInclusive,
            //==totals from lines total above==
            authorisedAmount: this.authorisedAmount,
            authorisedVat: this.authorisedVat,
            authorisedTotalInclusive: this.authorisedTotalInclusive,
            //==
            payeeId: this.invoiceDataSelected.payeeId,
            payeeTypeId: this.invoiceDataSelected.payeeTypeId,
            underAssessReasonId: this.invoiceDataSelected.underAssessReasonId,
            underAssessedComments: this.invoiceDataSelected.underAssessedComments,
            switchBatchInvoiceId: this.invoiceDataSelected.switchBatchInvoiceId,
            holdingKey: this.invoiceDataSelected.holdingKey,
            isPaymentDelay: this.invoiceDataSelected.isPaymentDelay,
            isPreauthorised: this.invoiceDataSelected.isPreauthorised,
            preAuthXml: this.invoiceDataSelected.preAuthXml,
            comments: this.invoiceDataSelected.comments,
            invoiceLines: this.medicalInvoiceLineItem,
            invoiceLineDetails : this.medicalInvoiceLineItem,
            invoiceUnderAssessReasons: this.invoiceUnderAssessReason
          }

          let invoiceWithLineItemsData = invoiceWithLineItems as InvoiceDetails;

          let medicalInvoiceAssessAllocateData: InvoiceAssessAllocateData = {
            invoiceDetail: invoiceWithLineItemsData,
            InvoiceAllocation: invoiceAllocations,
            tebaInvoice: (this.switchBatchType == SwitchBatchType.Teba) ? MedicareUtilities.convertInvoiceDetailsToTebaInvoice(invoiceWithLineItemsData) : new TebaInvoice()//awaiting feedback from business if there are any extras
          }

          var underAssessReasonAceepted = true;
          var errorMessage = '';
          for (let i = 0; i < medicalInvoiceAssessForm.value.allocationLines.length; i++) {
            includeState = medicalInvoiceAssessForm.value.allocationLines[i].include;
            var hasOverridePermission = userUtility.hasPermission('OverrideMedicalInvoiceDuplicateLineItem');
            if(hasOverridePermission)
              errorMessage = 'Please note that duplicate line item exist,click on override to proceed';
            else
              errorMessage = 'Please note that duplicate line item exist.';
            if(includeState){
              for (let index = 0; index < this.invoiceDataSelected.invoiceUnderAssessReasons.length; index++) {
                if(this.invoiceDataSelected.invoiceUnderAssessReasons[index].underAssessReasonId == 2){
                  underAssessReasonAceepted = false;
                }
              }
            }
          }

          this.medicareMedicalInvoiceCommonService.checkForMedicalReport(this.invoiceDataSelected.healthCareProviderId,this.invoiceDataSelected.invoiceId). subscribe((result: boolean) => {   
           if (!result) {
              this.confirmservice.confirmWithoutContainer('Medical Report:', 'No medical report found',
                  'Center', 'Center', 'Ok').subscribe(result => {
                    this.isLoading = false;
                  });
            }
            else
            {
              if(!underAssessReasonAceepted)
              {
                this.confirmservice.confirmWithoutContainer('Duplicate lineitem:', errorMessage,
                      'Center', 'Center', 'Ok').subscribe(result => {
                        this.isLoading = false;
                      });
              }
              else
              {
                this.validateMedicalBenefit(medicalInvoiceAssessAllocateData);
              }
            }
          });

          

        
        
        }
      else {
        this.confirmservice.confirmWithoutContainer('Amount Exceeds Tariff:', 'Please make sure line amounts do not exceeds Tariff Amount',
          'Center', 'Center', 'OK').subscribe(result => {
            this.isLoading = false;
          });
      }

    }
    else {

      this.confirmservice.confirmWithoutContainer('Error Message:', 'Please make sure all validations are met and include/exclude selection is made for all lines',
        'Center', 'Center', 'OK').subscribe(result => {
          this.isLoading = false;
        });
    }

  }

  validateMedicalBenefit(medicalInvoiceAssessAllocateData: InvoiceAssessAllocateData) {
    switch (this.switchBatchType) {
      case SwitchBatchType.MedEDI:
        this.medicalInvoiceClaimService.validateMedicalBenefit(this.invoiceDataSelected.claimId, this.invoiceDataSelected.invoiceDate).subscribe((res) => {
          if (!res) {
            this.confirmservice.confirmWithoutContainer('No medical benefit Validation', `No medical benefit exist on this claim.Click OK to Proceed`,
              'Center', 'Center', 'OK').subscribe(result => {
                if (result) {
                  this.submitMedicalInvoiceAssess(medicalInvoiceAssessAllocateData);
                }
                else
                  this.isLoading = false;
              });
          }
          else {
            this.submitMedicalInvoiceAssess(medicalInvoiceAssessAllocateData);
          }
        });
        break;
      case SwitchBatchType.Teba:
        this.submitMedicalInvoiceAssess(medicalInvoiceAssessAllocateData);
        break;
      default:
        break;
    }

  }

  submitMedicalInvoiceAssess(medicalInvoiceAssessAllocateData: InvoiceAssessAllocateData) {
    this.assessAllocationSubmitSubcription = this.medicareMedicalInvoiceCommonService.assessAllocationSubmit(medicalInvoiceAssessAllocateData).subscribe(responseResult => {

      if (responseResult > 0) {
        this.isLoading = false;
        this.alertService.success(`Invoice Allocated successfully`);
        this.dialogRef.close();
      }
      else {
        this.confirmservice.confirmWithoutContainer('Invoice Allocation failed:', 'Allocation failed, please review',
          'Center', 'Center', 'OK').subscribe(result => {
            this.isLoading = false;
            this.alertService.error(`Invoice Allocation failed`);
          });
      }

    });
  }
  onOverride() {

  }

  onAllocateRejectPend() {

  }

  getEvent(PersonEventIdParam) {
    if (PersonEventIdParam > 0) {
      this.loadingClaimsData$.next(true);
      this.loadingPayee$.next(true);
      this.eventService.getPersonEventDetails(PersonEventIdParam).subscribe(result => {
        this.selectedEvent = result;
        this.personEventId = result?.personEvents[0]?.personEventId;
        this.loadingClaimsData$.next(false);
        this.getPayeeDetails()
      })
    }
  }

  getPayeeDetails() {
    this.loadingPayee$.next(true);
    let selectedPayeeTypeId = this.invoiceDataSelected?.payeeTypeId

    switch (this.switchBatchType) {
      case SwitchBatchType.MedEDI:
        //awaiting Medicare business to confirm wether Payee or RolePlayer types to be used
        const rolePlayerId = (PayeeTypeEnum.Individual == selectedPayeeTypeId) ? this.selectedEvent?.personEvents[0]?.insuredLifeId
          : (PayeeTypeEnum.Employer == selectedPayeeTypeId) ? this.selectedEvent?.personEvents[0]?.companyRolePlayerId
            : (PayeeTypeEnum.HealthCareProvider == selectedPayeeTypeId) ? this.invoiceData?.healthCareProviderId : 0;

        if (rolePlayerId > 0) {
          this.roleplayerService.getRolePlayer(rolePlayerId).subscribe(result => {
            this.rolePlayerDetails = result
            this.payeeName = this.rolePlayerDetails.displayName.length > 0 ? this.rolePlayerDetails.displayName : "N/A";
            this.loadingPayee$.next(false);
          });
        }
        else {
          this.loadingPayee$.next(false);
          this.payeeName = "N/A";
        }

        break;
      case SwitchBatchType.Teba:
        this.payeeName = PayeeTypeEnum[PayeeTypeEnum.Teba];
        this.loadingPayee$.next(false);
        break;
      default:
        break;
    }
  }

  setPersonEvent(event: PersonEventModel) {
    this.selectedPersonEvent = event;
  }

  getMedicalReportDetails() {
    this.loadingClaimsData$.next(true);
    this.medicareMedicalInvoiceCommonService.getMappedInvoiceMedicalReports(this.invoiceDataSelected?.invoiceId).subscribe(res => {
      this.medicalReportList = res;
      this.loadingClaimsData$.next(false);
    });
  }

  getError(control, i): string {

    switch (control) {
      case 'authorisedQuantity':
        if (this.medicalInvoiceAssessForm.controls.allocationLines.invalid) {
          return 'Quantity required';
        }
        break;
      case 'authorisedAmountInclusive':
        if (this.medicalInvoiceAssessForm.controls.allocationLines.invalid) {
          if (Number(this.medicalInvoiceAssessForm.value.allocationLines[i].authorisedAmountInclusive) > Number(this.invoiceDataSelected.invoiceTotalInclusive)) {
            return 'Amount Exceeds Invoice Total';
          }
          else {
            return 'Amount required';
          }
        }
        break;
      case 'underAssessReason':
        if (this.medicalInvoiceAssessForm.controls.allocationLines.invalid) {
          return 'Reason required';
        }
        break;
      case 'allocationRulesResults':

        if (i.ruleResults.length > 0) {

          let errorMessages: any[] = [];

          for (let index = 0; i < i.ruleResults.lengt; index++) {
            errorMessages.push(i.ruleResults[index].ruleName + " <br> ")
          }

          let failed = errorMessages.toString();
          return "FAILED: " + failed;
        }
        break;
      default:
        return '';
    }
  }

  ngOnDestroy() {
    this.activeRoute.snapshot.data
    this.invoiceLineItems = [];
    if (this.assessAllocationSubmitSubcription) {
      this.assessAllocationSubmitSubcription.unsubscribe();
    }
  }

}

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: UntypedFormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return (control && control.invalid);
  }
}
