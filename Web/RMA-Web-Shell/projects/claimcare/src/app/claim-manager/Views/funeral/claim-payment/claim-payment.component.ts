import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormControl, Validators, UntypedFormGroup } from '@angular/forms';
import { DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { MatStepper } from '@angular/material/stepper';
import { DetailsComponent } from 'projects/shared-components-lib/src/lib/details-component/details-component';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { BeneficiaryBankDetail } from 'projects/shared-components-lib/src/lib/beneficiary-banking-detail/beneficiary-bank-detail.model';
import { ClaimPaymentModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/claim-payment.model';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { DecisionTypes } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/claim-payment.model';
import { DatePipe, DecimalPipe } from '@angular/common';
import { BeneficiaryTypeEnum } from 'projects/shared-models-lib/src/lib/enums/beneficiary-type-enum';
import { Note } from 'projects/shared-components-lib/src/lib/notes/note';
import { NotesRequest } from 'projects/shared-components-lib/src/lib/notes/notes-request';
import { NotesService } from 'projects/shared-components-lib/src/lib/notes/notes.service';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { StatusType } from 'projects/claimcare/src/app/claim-manager/shared/enums/status.enum';
import { DecisionEnum } from 'projects/claimcare/src/app/claim-manager/shared/enums/decision-enum';
import { ClaimInvoice } from 'projects/claimcare/src/app/claim-manager/shared/entities/Claim-invoice.model';
import { InvoiceAllocation } from 'projects/claimcare/src/app/claim-manager/shared/entities/invoice-allocation.model';
import { PaymentMethodEnum } from 'projects/shared-models-lib/src/lib/enums/payment-method-enum';
import { ClaimInvoiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-invoice-type-enum';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { ClaimTracerInvoice } from 'projects/clientcare/src/app/policy-manager/shared/entities/claim-tracer-invoice';
import { ClaimsCalculatedAmount } from 'projects/clientcare/src/app/policy-manager/shared/entities/claims-calculated-amount';
import { Subscription, forkJoin } from 'rxjs';
import { UnclaimBnefitsValuesService } from 'projects/fincare/src/app/finance-manager/views/unclaim-bnefits-values.service';
import { UnclaimedBenefitInvestmentResult } from 'projects/clientcare/src/app/policy-manager/shared/entities/UnclaimedBenefitInvestmentResult';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { FeatureflagUtility } from 'projects/shared-utilities-lib/src/lib/featureflag-utility/featureflag-utility';
import { ClaimDeclineReasonEnum } from 'projects/shared-models-lib/src/lib/enums/claim-decline-reason-enum';

@Component({
  selector: 'app-claim-payment',
  templateUrl: './claim-payment.component.html',
  styleUrls: ['./claim-payment.component.css'],
  providers: [DecimalPipe]
})

export class ClaimPaymentComponent extends DetailsComponent implements OnInit, OnDestroy {
  [x: string]: any;

  decisionFormGroup: UntypedFormGroup;
  bankingDetailsFormGroup: UntypedFormGroup;
  paymentDetailsFormGroup: UntypedFormGroup;
  beneficiaryDetailsFormGroup: UntypedFormGroup;
  unclaimedBenefitFormGroup: UntypedFormGroup;

  bankId: number;
  claimId: number;
  beneficiaryId = 0;
  checkDecisionId: number;

  messages: any;
  dateValue: any;
  decisionTypes: any;
  errorMessages: any[];

  isLoading: boolean;
  saveDisabled = false;
  isProcessing: boolean;
  disableReason: boolean;
  isMessageText: boolean;
  disableAmounts: boolean;
  disableNoteText: boolean;
  disableTracingFee: boolean;
  disableRefund: boolean;
  disableOutstanding: boolean;
  disableTotalClaimAmount: boolean;
  showReverseReason: boolean;
  showDecisionReason: boolean;
  disableAllocPercent: boolean;
  disableReverseReason: boolean;
  disableChkBankingDet: boolean;
  isAdminApproveDecline: boolean;
  disableBeneficiaryCoverAmount: boolean;
  disableUnclaimedInterestAmount: boolean;
  isUnclaimedBenefit: boolean;
  datesCaptured: boolean;
  isEndDate: boolean;
  disableClaimsManager: boolean;
  showClaimManager: boolean;

  minDate: Date;
  feeInvestigationDate: Date;

  currentUser: User;
  statusEnum = StatusType;
  currentUserEmail: string;
  notesRequest: NotesRequest;
  claimInvoice: ClaimInvoice;
  decisionEnum = DecisionEnum;
  claimPaymentDetail: ClaimPaymentModel;
  paymentMethodEnum = PaymentMethodEnum;
  claimPaymentDetails: ClaimPaymentModel[];
  claimInvoiceTypeEnum = ClaimInvoiceTypeEnum;
  unclaimedInterest: any;
  claimManagers: User[];
  claimDeclineReasons: any;
  private calculatedAmountSubcription: Subscription;

  reasons = [
    { id: 2, reason: 'Overaged Child' },
    { id: 3, reason: 'False information at application stage' },
    { id: 4, reason: 'Still born under 26 weeks' },
    { id: 5, reason: 'Life assured died within the waiting period' },
    { id: 6, reason: 'Suicide within the first 12months from DOC or increase cover date' },
    { id: 7, reason: 'Late notification (after 3 months of date of death' },
    { id: 9, reason: 'Life Assured died prior to Policy start date' },
    { id: 10, reason: 'Life Assured not covered on the policy' },
    { id: 11, reason: 'No policy at RMA' },
    { id: 12, reason: 'Stillbirth decline - max payout exceeded' },
    { id: 13, reason: 'Premium in arrears' },
    { id: 14, reason: 'Exclusion - Cause of Death Excluded' }
  ];

  reverseReasons = [
    { id: 1, reverseReason: 'Incorrect banking details' },
    { id: 2, reverseReason: 'Request to pay different account' },
    { id: 3, reverseReason: 'Incorrect decision' },
    { id: 4, reverseReason: 'Duplicate payment' },
    { id: 5, reverseReason: 'Incorrect amount' }
  ]
  //getClaimResult: any;

  constructor(
    private readonly claimCareService: ClaimCareService,
    private readonly alertService: AlertService,
    private readonly appEventsManager: AppEventsManager,
    private readonly router: Router,
    dateAdapter: DateAdapter<NativeDateAdapter>,
    private readonly activatedRoute: ActivatedRoute,
    private readonly datePipe: DatePipe,
    private readonly decimalPipe: DecimalPipe,
    private readonly authService: AuthService,
    private readonly notesService: NotesService,
    private readonly formBuilder: UntypedFormBuilder,
    private unclaimedBenefitsValuesService: UnclaimBnefitsValuesService,
    private readonly confirmservice: ConfirmationDialogsService) {
    super(appEventsManager, alertService, router, '', '', 1);
    dateAdapter.setLocale('en-za');
  }

  showBankAccount: boolean;
  beneficiaryBankingDetails: BeneficiaryBankDetail[];
  selectedClaimDecision: any;
  relation = 'Beneficiary';
  declineClaimFeatureFlag = FeatureflagUtility.isFeatureFlagEnabled('DeclineClaim137930');
  referToManageFeatureFlag = (!FeatureflagUtility.isFeatureFlagEnabled('RemoveReferToManager137930'));
  ngOnInit() {
    this.activatedRoute.params.subscribe((params: any) => {
      this.claimId = params.id;
      this.beneficiaryId = params.benId;
      this.bankId = params.banId;
      if(this.referToManageFeatureFlag){ this.getClaimManagers();}     
      this.getClaimPaymentDetail();
      this.showBankAccount = false;
      this.getLookups();
      this.createForm();
      // TODO Uncomment this after new database structure is complete
      // this.paymentDetailsFormGroup.get('txtTotalClaim').disable();
      // this.paymentDetailsFormGroup.get('txtRefund').disable();
      // this.paymentDetailsFormGroup.get('txtOutstandingPremiums').disable();
      // this.paymentDetailsFormGroup.get('txtBenefitCoverAmount').disable();
      this.currentUser = this.authService.getCurrentUser();
      this.currentUserEmail = this.currentUser.email;
      this.isAdminApproveDecline = false;

      if (this.currentUser.roleName === 'Administrator') {
        this.isAdminApproveDecline = true;
      }
    });

    var dt = this.minDate = new Date();
    dt.setDate(dt.getDate() - 1);
  }

  getClaimManagers(){
    this.claimCareService.getClaimManagers().subscribe(
      data => {
        this.claimManagers = data;
      }
    );
  }

  createForm() {
    this.clearDisplayName();
    if (this.beneficiaryDetailsFormGroup && this.bankingDetailsFormGroup && this.paymentDetailsFormGroup && this.decisionFormGroup) {
      return;
    }

    this.beneficiaryDetailsFormGroup = this.formBuilder.group({
      txtPolicyNumber: new UntypedFormControl(''),
      txtFirstName: new UntypedFormControl(''),
      txtIdentityNumber: new UntypedFormControl(''),
      txtDateOfBirth: new UntypedFormControl(''),
      txtContactNumber: new UntypedFormControl(''),
      txtClaimNumber: new UntypedFormControl(''),
      txtLastName: new UntypedFormControl(''),
      txtPassportNumber: new UntypedFormControl(''),
      txtRelationToDeceased: new UntypedFormControl(''),
      txtEmail: new UntypedFormControl('')
    });

    this.bankingDetailsFormGroup = this.formBuilder.group({
      txtNameOfAccountHolder: new UntypedFormControl(''),
      txtNameOfBank: new UntypedFormControl(''),
      txtAccountNumber: new UntypedFormControl(''),
      txtAccountType: new UntypedFormControl(''),
      txtBranchCode: new UntypedFormControl(''),
      txtBankMessage: new UntypedFormControl(''),
      chkApproveBankingDetails: new UntypedFormControl(),
    });

    this.paymentDetailsFormGroup = this.formBuilder.group({
      txtBenefitCoverAmount: new UntypedFormControl(''),
      txtRefund: new UntypedFormControl(''),
      txtUnclaimedAmount: new UntypedFormControl(''),
      txtTotalClaim: new UntypedFormControl(''),
      txtAllocationPercentage: new UntypedFormControl(''),
      txtTracingFee: new UntypedFormControl(''),
      hdnBeneficiaryId: new UntypedFormControl(''),
      hdnClaimPaymentId: new UntypedFormControl(''),
      hdnPolicyId: new UntypedFormControl(''),
      hdnProductId: new UntypedFormControl(''),
      hdnClaimInvoiceId: new UntypedFormControl(''),
      hdnBankAccountId: new UntypedFormControl(''),
      txtOutstandingPremiums: new UntypedFormControl(''),
      hdnInvoiceAllocationId: new UntypedFormControl('')
    });

    this.decisionFormGroup = this.formBuilder.group({
      claimDecision: new UntypedFormControl('', [Validators.required]),
      reason: new UntypedFormControl(''),
      reverseReason: new UntypedFormControl(''),
      noteText: ['', [Validators.required, Validators.minLength(3)]],
      hdnDeclineReasonId: new UntypedFormControl(''),
      claimManagerSelect: new UntypedFormControl('')
    });

    this.unclaimedBenefitFormGroup = this.formBuilder.group({
      unclaimedBenefitAmount: new UntypedFormControl(''),
      startDate: new UntypedFormControl(''),
      endDate: new UntypedFormControl(''),
      investigationAmount: new UntypedFormControl(''),
      investigationFeeDate: new UntypedFormControl('')
    });
  }

  getClaimPaymentDetail(): void {
    this.appEventsManager.loadingStart(`Calculating payment amounts...`);

    forkJoin(this.claimCareService.GetClaimPaymentDetail(this.claimId, this.beneficiaryId, this.bankId),
      this.claimCareService.isUnclaimedBenefit(this.claimId))
      .subscribe(data => {
        this.claimInvoice = data[0] as ClaimInvoice;
        this.isUnclaimedBenefit = data[1];
        this.isMessageText = this.claimInvoice.messageText !== null ? true : false;

        if (this.claimInvoice.beneficiaryDetail.beneficiaryTypeId === BeneficiaryTypeEnum.Child) {
          this.claimInvoice.messageText = this.claimInvoice.messageText + '.' + 'Maximum amount will be paid';
        }

        this.claimInvoice.messageText = this.claimInvoice.messageText;
        this.disableClaimAmounts();
        this.setForm(this.claimInvoice);
        this.appEventsManager.loadingStop();

      }, (error) => {
        this.alertService.error(error);
      })
  }

  setForm(item: any) {
    console.log(item);
    this.beneficiaryBankingDetails = item;

    if (item == null) {
      return;
    }

    this.checkDecisionId = item.decisionId;
    this.disableReason = true;
    this.disableNoteText = false;
    this.showDecisionReason = true;
    this.showReverseReason = false;
    this.disableChkBankingDet = true;
    this.showClaimManager = true;

    if (this.checkDecisionId === this.decisionEnum.ReAssess) {
      this.decisionTypes = [new DecisionTypes(1, 'Approve')];
      if(this.referToManageFeatureFlag){this.decisionTypes.push(new DecisionTypes(6, 'Refer To Manager'))}
      this.dateValue = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
      this.disableAmounts = false;
    } else if (item.claimStatusId === this.statusEnum.Unpaid && this.checkDecisionId === this.decisionEnum.Authorise) {
      this.decisionTypes = [new DecisionTypes(5, 'Payment Reversal')];
      this.dateValue = this.datePipe.transform(item.capturedDate, 'yyyy-MM-dd');
      this.disableAmounts = true;
      this.showDecisionReason = false;
      this.showReverseReason = true;
      this.disableNoteText = false;
    } else if (this.checkDecisionId === this.decisionEnum.Approve) {
      this.decisionTypes = [new DecisionTypes(3, 'Authorise'), new DecisionTypes(4, 'Re-Assess')];
      this.dateValue = this.datePipe.transform(item.capturedDate, 'yyyy-MM-dd');
      this.disableClaimAmounts();
      this.disableChkBankingDet = false;
    } else if (this.checkDecisionId === this.decisionEnum.Decline) {
      this.decisionTypes = [new DecisionTypes(1, 'Approve')];
      if(this.referToManageFeatureFlag){this.decisionTypes.push(new DecisionTypes(6, 'Refer To Manager'))}
      if (item.claimStatusId === this.statusEnum.ExGratia) {
        // this.enableClaimAmountsForExGratia();
      } else {
        this.disableClaimAmounts();
      }
    } else if (this.checkDecisionId === this.decisionEnum.ReferToManager) {
      this.decisionTypes = [new DecisionTypes(4, 'Re-Assess'), new DecisionTypes(7, 'Refer To Complaint Support Manager')];
      this.dateValue = this.datePipe.transform(item.capturedDate, 'yyyy-MM-dd');
      this.disableClaimAmounts();
    } else if (this.checkDecisionId === this.decisionEnum.ReferToComplaintSupportManager) {
      this.decisionTypes = [new DecisionTypes(4, 'Re-Assess'), new DecisionTypes(2, 'Decline')];
      this.dateValue = this.datePipe.transform(item.capturedDate, 'yyyy-MM-dd');
      this.disableClaimAmounts();
    } else if (this.checkDecisionId === this.decisionEnum.PaymentReversal) {
      this.decisionTypes = [new DecisionTypes(8, 'Approve Reversal'), new DecisionTypes(9, 'Reject Reversal')];
      this.showDecisionReason = false;
      this.showReverseReason = true;
      this.disableReverseReason = true;
      this.dateValue = this.datePipe.transform(item.capturedDate, 'yyyy-MM-dd');
      this.disableClaimAmounts();
    } else {
      this.dateValue = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
      this.decisionTypes = [new DecisionTypes(1, 'Approve')];
      if(this.declineClaimFeatureFlag){this.decisionTypes.push(new DecisionTypes(2, 'Decline'))}
      if(this.referToManageFeatureFlag){this.decisionTypes.push(new DecisionTypes(6, 'Refer To Manager'))}
      this.disableAmounts = false;
    }

    if (this.checkDecisionId === this.decisionEnum.Approve && (item.claimStatusId === this.statusEnum.Authorised || item.claimStatusId === this.statusEnum.Paid || item.claimStatusId === this.statusEnum.Unpaid)) {
      this.decisionTypes = [new DecisionTypes(5, 'Payment Reversal')];
      this.dateValue = this.datePipe.transform(item.capturedDate, 'yyyy-MM-dd');
      this.disableAmounts = true;
      this.showDecisionReason = false;
      this.showReverseReason = true;
    }

    if (this.checkDecisionId === this.decisionEnum.PaymentReversal && (item.claimStatusId === this.statusEnum.Authorised || item.claimStatusId === this.statusEnum.Paid || item.claimStatusId === this.statusEnum.Unpaid)) {
      this.decisionTypes = [new DecisionTypes(5, 'Payment Reversal')];
      this.dateValue = this.datePipe.transform(item.capturedDate, 'yyyy-MM-dd');
      this.disableAmounts = true;
      this.showDecisionReason = false;
      this.showReverseReason = true;
    }

    if (this.checkDecisionId === this.decisionEnum.PaymentReversal && (item.claimStatusId === this.statusEnum.Authorised || item.claimStatusId === this.statusEnum.Paid || item.claimStatusId === this.statusEnum.Unpaid)) {
      this.decisionTypes = [new DecisionTypes(5, 'Payment Reversal')];
      this.dateValue = this.datePipe.transform(item.capturedDate, 'yyyy-MM-dd');
      this.disableAmounts = true;
      this.showDecisionReason = false;
      this.showReverseReason = true;
    }

    this.beneficiaryDetailsFormGroup.patchValue({
      txtPolicyNumber: item.policyNumber,
      txtFirstName: item.beneficiaryDetail.firstname,
      txtIdentityNumber: item.beneficiaryDetail.idNumber,
      txtDateOfBirth: this.datePipe.transform(item.beneficiaryDetail.dateOfBirth, 'yyyy-MM-dd'),
      txtContactNumber: item.beneficiaryDetail.contactNumber,
      txtClaimNumber: item.claimReferenceNumber,
      txtLastName: item.beneficiaryDetail.lastname,
      txtPassportNumber: item.beneficiaryDetail.passportNumber,
      txtRelationToDeceased: this.relation,
      txtEmail: item.beneficiaryDetail.email
    });

    this.bankingDetailsFormGroup = this.formBuilder.group({
      txtNameOfAccountHolder: item.beneficiaryDetail.rolePlayerBankAccount.accountHolderName,
      txtNameOfBank: item.beneficiaryDetail.rolePlayerBankAccount.bankName,
      txtAccountNumber: item.beneficiaryDetail.rolePlayerBankAccount.accountNumber,
      txtAccountType: item.beneficiaryDetail.rolePlayerBankAccount.accountType,
      txtBranchCode: item.beneficiaryDetail.rolePlayerBankAccount.branchCode,
      txtBankMessage: item.claimBankAccountVerification.messageDescription,
      chkApproveBankingDetails: item.isBankingApproved,
    });

    let invoiceAllocationId = null;

    if (item.invoiceAllocations.length > 0) {
      invoiceAllocationId = item.invoiceAllocations[0].invoiceAllocationId;
    }

    this.paymentDetailsFormGroup = this.formBuilder.group({
      txtBenefitCoverAmount: item.coverAmount ? item.coverAmount : 0.00,
      txtRefund: item.refund,
      txtUnclaimedAmount: item.unclaimedPaymentInterest ? this.decimalPipe.transform(item.unclaimedPaymentInterest, '1.2-2') : 0.00,
      txtTotalClaim: [item.claimAmount, [Validators.required, Validators.min(1), Validators.max(item.coverAmount)]],
      txtAllocationPercentage: item.beneficiaryDetail.allocationPercentage,
      txtTracingFee: item.tracingFees ? this.decimalPipe.transform(item.tracingFees, '1.2-2') : 0.00,
      hdnBeneficiaryId: this.beneficiaryId,
      hdnClaimPaymentId: item.claimId,
      hdnPolicyId: item.policyId,
      hdnProductId: item.productId,
      hdnClaimInvoiceId: item.id,
      hdnBankAccountId: this.bankId,
      txtOutstandingPremiums: item.outstandingPremium,
      hdnInvoiceAllocationId: invoiceAllocationId,
    });

    this.decisionFormGroup = this.formBuilder.group({
      claimDecision: new UntypedFormControl('', [Validators.required]),
      reason: new UntypedFormControl(''),
      reverseReason: new UntypedFormControl(''),
      noteText: [item.claimNote, [Validators.required, Validators.minLength(3)]],
      hdnDeclineReasonId: 0,
      claimManagerSelect: new UntypedFormControl('')
    });

    if (this.isUnclaimedBenefit) {
      let claimTracerInvoice: ClaimTracerInvoice = null;
      let claimsCalculatedAmount: ClaimsCalculatedAmount = null;
      this.calculatedAmountSubcription = forkJoin(
        this.unclaimedBenefitsValuesService
          .GetUnclaimedBenefitByClaimId(this.claimId),
        this.unclaimedBenefitsValuesService.GetClaimsCalculatedAmountByClaimId(this.claimId))
        .subscribe(data => {
          claimTracerInvoice = data[0];
          claimsCalculatedAmount = data[1];
        }, (error) => {
          console.log(error);
        }, () => {
          this.unclaimedBenefitFormGroup.patchValue({
            investigationAmount: claimTracerInvoice ? claimTracerInvoice.tracingFee : 0,
            investigationFeeDate: claimTracerInvoice ? claimTracerInvoice.payDate : null,
            unclaimedBenefitAmount: claimsCalculatedAmount.totalAmount
          })
        })
    }

    if (item.decisionReasonId != null) {
      this.decisionFormGroup.get('reason').setValue(item.decisionReasonId);
    }

    if (item.reversalReasonId != null) {
      this.decisionFormGroup.get('reverseReason').setValue(item.reversalReasonId);
    }

    this.decisionFormGroup.get('hdnDeclineReasonId').setValue(item.decisionReasonId);
  }

  public ngOnDestroy(): void {
    if (this.calculatedAmountSubcription) {
      this.calculatedAmountSubcription.unsubscribe();
    }
  }

  disableClaimAmounts() {
    this.disableAmounts = true;
    this.disableBeneficiaryCoverAmount = true;
    this.disableAllocPercent = true;
    this.disableTotalClaimAmount = !userUtility.hasPermission('Edit Claim Amount');
    this.disableOutstanding = true;
    this.disableRefund = true;

    this.disableTotalClaimAmount ? this.paymentDetailsFormGroup.get('txtTotalClaim').disable()
      : this.paymentDetailsFormGroup.get('txtTotalClaim').enable();

    this.paymentDetailsFormGroup.get('txtRefund').disable();
    this.paymentDetailsFormGroup.get('txtOutstandingPremiums').disable();
    this.paymentDetailsFormGroup.get('txtBenefitCoverAmount').disable();
    this.paymentDetailsFormGroup.get('txtUnclaimedAmount').disable();
    this.paymentDetailsFormGroup.get('txtAllocationPercentage').disable();
    this.paymentDetailsFormGroup.get('txtTracingFee').disable();
  }

  // enableClaimAmountsForExGratia() {
  //   this.disableAmounts = false;
  //   this.disableBeneficiaryCoverAmount = false;
  //   this.disableUnclaimedInterestAmount = false;
  //   this.disableAllocPercent = false;
  //   this.disableTracingFee = false;
  // }

  readForm() {
    return this.beneficiaryBankingDetails;
  }

  addClaimPayment() {
    this.addConfirmation();
  }

  claimDecisionChanged($event: any) {
    this.selectedClaimDecision = $event.value as number;
    
   if (this.selectedClaimDecision === this.decisionEnum.ReferToManager) {
      this.disableReason = false;
      this.disableClaimsManager = false;
      this.showClaimManager = false;
    
        this.decisionFormGroup.get('claimManagerSelect').setValue(null);
      
    } else {
      const declineReasonId = this.decisionFormGroup.get('hdnDeclineReasonId').value;
      if (declineReasonId === 0) {
        this.decisionFormGroup.get('reason').setValue(null);
      } else {
        if (this.selectedClaimDecision === this.decisionEnum.Approve) {
          this.decisionFormGroup.get('reason').setValue(null);
        }
      }
      this.disableReason = true;
      this.disableClaimsManager = true;
      this.decisionFormGroup.get('claimManagerSelect').setValue(null);
      this.showClaimManager = true;
    }

    if (this.selectedClaimDecision === this.decisionEnum.ReAssess || this.selectedClaimDecision === this.decisionEnum.RejectReversal ||
      this.selectedClaimDecision === this.decisionEnum.PaymentReversal || this.selectedClaimDecision === this.decisionEnum.ReferToManager ||
      this.selectedClaimDecision === this.decisionEnum.ReferToComplaintSupportManager || this.selectedClaimDecision === this.decisionEnum.Decline ||
      this.selectedClaimDecision === this.decisionEnum.Approve || this.selectedClaimDecision === this.decisionEnum.Authorise || this.selectedClaimDecision === this.decisionEnum.ApproveReversal) {
      this.disableNoteText = false;
    } else {
      this.disableNoteText = true;
    }
  }

  // Confiramtion on whether you want to add a beneficiary or not
  addConfirmation(): void {
    this.confirmservice.confirmWithoutContainer('Confirm Decision', ` Are you sure you want to continue?`,
      'Center', 'Center', 'Yes', 'No').subscribe(
        result => {
          if (result === true) {
            const beneficiaryDetailsFormGroup = this.beneficiaryDetailsFormGroup.value;
            const bankingDetailsFormGroup = this.bankingDetailsFormGroup.value;
            const paymentDetailsFormGroup = this.paymentDetailsFormGroup.value;
            const decisionFormGroup = this.decisionFormGroup.value;
            const claimPaymentDetailsAdd = new ClaimPaymentModel();
            claimPaymentDetailsAdd.invoiceAllocations = new Array();
            const invoiceAllocations = new InvoiceAllocation();

            claimPaymentDetailsAdd.beneficiaryId = paymentDetailsFormGroup.hdnBeneficiaryId;
            claimPaymentDetailsAdd.claimId = paymentDetailsFormGroup.hdnClaimPaymentId;
            claimPaymentDetailsAdd.claimReferenceNumber = beneficiaryDetailsFormGroup.txtClaimNumber;
            claimPaymentDetailsAdd.policyId = paymentDetailsFormGroup.hdnPolicyId;
            claimPaymentDetailsAdd.policyNumber = beneficiaryDetailsFormGroup.txtPolicyNumber;
            // claimPaymentDetailsAdd.capturedDate = formModel.dateOfPayment; -- missing field
            claimPaymentDetailsAdd.productId = paymentDetailsFormGroup.hdnProductId;
            // claimPaymentDetailsAdd.product = formModel.txtProduct; -- missing field
            claimPaymentDetailsAdd.outstandingPremium = paymentDetailsFormGroup.txtOutstandingPremiums;
            claimPaymentDetailsAdd.refund = paymentDetailsFormGroup.txtRefund;
            claimPaymentDetailsAdd.totalClaim = this.paymentDetailsFormGroup.controls.txtTotalClaim.value;
            claimPaymentDetailsAdd.tracingFees = paymentDetailsFormGroup.TracingFee;
            claimPaymentDetailsAdd.coverAmount = paymentDetailsFormGroup.txtBenefitCoverAmount;
            claimPaymentDetailsAdd.capAmount = this.paymentDetailsFormGroup.controls.txtTotalClaim.value; // this.claimPaymentDetail.capAmount;
            claimPaymentDetailsAdd.claimAmount = this.paymentDetailsFormGroup.controls.txtTotalClaim.value;
            claimPaymentDetailsAdd.decisionReasonId = decisionFormGroup.reason ? this.getReason(decisionFormGroup.reason) : null;
            claimPaymentDetailsAdd.reversalReasonId = decisionFormGroup.reverseReason;
            claimPaymentDetailsAdd.decisionId = decisionFormGroup.claimDecision;
            claimPaymentDetailsAdd.decision = decisionFormGroup.claimDecision;
            claimPaymentDetailsAdd.id = paymentDetailsFormGroup.hdnClaimInvoiceId;
            claimPaymentDetailsAdd.isBankingApproved = bankingDetailsFormGroup.chkApproveBankingDetails;
            claimPaymentDetailsAdd.unclaimedPaymentInterest = this.unclaimedInterest;
            claimPaymentDetailsAdd.referToManagerId = decisionFormGroup.claimManagerSelect;

            // ===========Invoice Allocation =========================//
            invoiceAllocations.beneificaryRolePlayerId = paymentDetailsFormGroup.hdnBeneficiaryId;
            invoiceAllocations.assessedAmount = this.paymentDetailsFormGroup.controls.txtTotalClaim.value;
            invoiceAllocations.assessedVat = 0;
            invoiceAllocations.paymentMethod = this.paymentMethodEnum.EFT;
            invoiceAllocations.percentAllocation = 100;
            invoiceAllocations.invoiceTypeId = this.claimInvoiceTypeEnum.FuneralExpenses;
            invoiceAllocations.invoiceAllocationStatusId = 1;
            invoiceAllocations.rolePlayerBankingId = paymentDetailsFormGroup.hdnBankAccountId;

            if (paymentDetailsFormGroup.hdnInvoiceAllocationId != null) {
              invoiceAllocations.invoiceAllocationId = paymentDetailsFormGroup.hdnInvoiceAllocationId;
            }
            claimPaymentDetailsAdd.invoiceAllocations.push(invoiceAllocations);

            this.claimPaymentDetails = new Array();
            this.claimPaymentDetails.push(claimPaymentDetailsAdd);

            this.errorMessages = new Array();
            const clmAmount = this.paymentDetailsFormGroup.controls.txtTotalClaim.value;

            if (bankingDetailsFormGroup.txtAccountNumber == null || bankingDetailsFormGroup.txtAccountNumber === '' || bankingDetailsFormGroup.txtAccountNumber === undefined) {
              this.alertService.error('No bank details exist. Cannot process', 'Error', true);
              return false;
            }

            if (this.selectedClaimDecision === undefined || this.selectedClaimDecision === null) {
              this.errorMessages.push('Claim decision required');
            }

            if ((clmAmount === '0' || clmAmount === undefined || clmAmount === null) && (this.selectedClaimDecision !== this.decisionEnum.Decline)) {
              this.errorMessages.push('Total claim required');
            }

            if (this.selectedClaimDecision === this.decisionEnum.Decline && (decisionFormGroup.reason == null || decisionFormGroup.reason === 0 || decisionFormGroup.reason === '')) {
              this.errorMessages.push('Reason is mandatory if claim decision is Decline');
            }

            if (this.selectedClaimDecision === this.decisionEnum.ReferToManager && (decisionFormGroup.reason == null || decisionFormGroup.reason === 0 || decisionFormGroup.reason === '')) {
              this.errorMessages.push('Reason is mandatory if claim decision is Refer To Manager');
            }

            if (this.selectedClaimDecision === this.decisionEnum.ReferToManager && (decisionFormGroup.claimManagerSelect == null || decisionFormGroup.claimManagerSelect === 0 || decisionFormGroup.claimManagerSelect === '')) {
              this.errorMessages.push('Claim manager is mandatory if claim decision is Refer To Manager');
            }

            const decisionTaken = this.selectedClaimDecision;
            const noteText = decisionFormGroup.noteText;
            if ((decisionTaken === this.decisionEnum.ReAssess
              || decisionTaken == this.decisionEnum.PaymentReversal
              || decisionTaken == this.decisionEnum.ReferToManager
              || decisionTaken == this.decisionEnum.ReferToComplaintSupportManager
              || decisionTaken == this.decisionEnum.Decline
              || decisionTaken == this.decisionEnum.Approve
              || decisionTaken == this.decisionEnum.Authorise
              || decisionTaken == this.decisionEnum.ApproveReversal
              || decisionTaken == this.decisionEnum.RejectReversal) && (noteText == null || noteText === '')) {
              this.errorMessages.push('Note is mandatory');
            }

            if (this.selectedClaimDecision === this.decisionEnum.PaymentReversal
              && (decisionFormGroup.reverseReason == null ||
                decisionFormGroup.reverseReason === 0 ||
                decisionFormGroup.reverseReason === '')) {
              this.errorMessages.push('Reason is mandatory if claim decision is Payment Reversal');
            }

            if (this.selectedClaimDecision === this.decisionEnum.Authorise && (claimPaymentDetailsAdd.isBankingApproved == null || claimPaymentDetailsAdd.isBankingApproved === false)) {
              this.errorMessages.push('Banking details not verified');
            }

            if (this.errorMessages.length > 0) {
              this.messages = '';
              this.errorMessages.forEach(element => {
                this.alertService.error(element, 'Error', true);
              });
              return false;
            }

            this.saveDisabled = true;
            this.isLoading = true;
            this.isProcessing = true;
            this.alertService.loading(`Processing...`, 'Processing', true);

            this.claimCareService.CreateClaimPayment(this.claimPaymentDetails).subscribe(validationResult => {
              if (validationResult.result) {
                if ((this.selectedClaimDecision === this.decisionEnum.ReAssess
                  || this.selectedClaimDecision === this.decisionEnum.PaymentReversal
                  || this.selectedClaimDecision === this.decisionEnum.ReferToManager
                  || this.selectedClaimDecision === this.decisionEnum.ReferToComplaintSupportManager
                  || decisionTaken == this.decisionEnum.Decline
                  || decisionTaken == this.decisionEnum.Approve
                  || decisionTaken == this.decisionEnum.Authorise
                  || decisionTaken == this.decisionEnum.RejectReversal
                  || decisionTaken == this.decisionEnum.ApproveReversal)
                  && (decisionFormGroup.noteText != null && decisionFormGroup.noteText !== '')) {

                  const note = new Note();

                  if (decisionFormGroup.reason > 0
                    || decisionFormGroup.reverseReason > 0) {
                    note.reason = decisionFormGroup.reason > 0
                      ? this.reasons.find(r => r.id === decisionFormGroup.reason).reason
                      : this.reverseReasons.find(reverse => reverse.id === decisionFormGroup.reverseReason).reverseReason;
                  }

                  note.text = decisionFormGroup.noteText.trim() as string;
                  note.itemId = this.claimId;
                  note.itemType = 'Claim';
                  note.isActive = true;
                  note.modifiedBy = this.currentUserEmail;
                  this.notesService.addNote(ServiceTypeEnum.ClaimManager, note).subscribe();
                }

                this.alertService.success(validationResult.message[0], 'Success', true);
                this.router.navigateByUrl('claimcare/claim-manager/claim-workpool');
              } else {
                this.alertService.error(validationResult.message[0], 'Error', true);
              }
            });
          }
        });
  }

  // // Changing the Total claim amounts on focusOut
  onInterestChange(event: any) {
    const unclaimed = event.target.value;
    const paymentDetailsFormGroup = this.paymentDetailsFormGroup.value;
    const traceFee = parseFloat(this.paymentDetailsFormGroup.get('txtTracingFee').value);

    if (unclaimed === '') {
      this.paymentDetailsFormGroup.patchValue({
        txtUnclaimedAmount: 0,
        txtTotalClaim: parseFloat(paymentDetailsFormGroup.txtBenefitCoverAmount) - traceFee
      });
    } else {
      this.paymentDetailsFormGroup.patchValue({
        txtTotalClaim: parseFloat(paymentDetailsFormGroup.txtBenefitCoverAmount) + parseFloat(unclaimed) - traceFee
      });
    }
  }

  onTraceFeeChanged(event: any) {
    const traceFee = event.target.value;
    const paymentDetailsFormGroup = this.paymentDetailsFormGroup.value;
    const unclaimed = parseFloat(this.paymentDetailsFormGroup.get('txtUnclaimedAmount').value);

    if (traceFee === '') {
      this.paymentDetailsFormGroup.patchValue({
        txtTracingFee: 0,
        txtTotalClaim: parseFloat(paymentDetailsFormGroup.txtBenefitCoverAmount) + unclaimed
      });
    } else {
      this.paymentDetailsFormGroup.patchValue({
        txtTotalClaim: parseFloat(paymentDetailsFormGroup.txtBenefitCoverAmount) + unclaimed - parseFloat(traceFee)
      });
    }
  }

  save() { }

  back() {
    this.router.navigateByUrl('claimcare/claim-manager/claim-workpool');
  }

  approveDecline() {
  }

  calculateUnclaimedBenefit(stepper: MatStepper) {
    const dateFormat = "yyyy-MM-dd";
    const unclaimedBenefitFormGroup = this.unclaimedBenefitFormGroup.value;
    const unclaimedAmount = unclaimedBenefitFormGroup.unclaimedBenefitAmount;
    const unclaimedStartDate = this.datePipe.transform(unclaimedBenefitFormGroup.startDate, dateFormat);
    const unclaimedEndDate = this.datePipe.transform(unclaimedBenefitFormGroup.endDate, dateFormat);
    const unclaimedInvestigationAmount = unclaimedBenefitFormGroup.investigationAmount;
    const unclaimedInvestigationDate = this.datePipe.transform(unclaimedBenefitFormGroup.investigationFeeDate, dateFormat);
    let unclaimedBenefitResult: UnclaimedBenefitInvestmentResult = null;

    const startDate = new Date(unclaimedStartDate);
    const endDate = new Date(unclaimedEndDate);
    let investigationDate = unclaimedInvestigationDate ? new Date(unclaimedInvestigationDate) : new Date(unclaimedStartDate);

    stepper.selectedIndex = stepper.selectedIndex - 1;

    if (investigationDate < startDate
      || investigationDate > endDate) {
      this.alertService.error("Investigation fee date cannot be less than StartDate and cannot be greater than enddate");
      return;
    }

    this.isLoading = true;
    this.unclaimedBenefitsValuesService.getUnclaimedBenefitInvestmentAmount
      (
        unclaimedAmount,
        unclaimedStartDate,
        unclaimedEndDate,
        unclaimedInvestigationAmount,
        unclaimedInvestigationDate ? unclaimedInvestigationDate : unclaimedStartDate)
      .subscribe(result => {
        unclaimedBenefitResult = result;
      }, (error) => {
        this.alertService.error(error);
        this.isLoading = false;
      }, () => {
        this.paymentDetailsFormGroup.patchValue({
          txtUnclaimedAmount: this.decimalPipe.transform(unclaimedBenefitResult.interestEarned, '1.2-2'),
          txtTotalClaim: unclaimedBenefitResult.investmentReturn
        });

        this.unclaimedInterest = unclaimedBenefitResult.interestEarned;

        stepper.selectedIndex = stepper.selectedIndex + 1;
        this.isLoading = false;
      });
  }

  endDateChanged(value: Date) {
    this.datesCaptured = true;
  }

  startDateChanged(value: Date) {
    this.isEndDate = true;
  }
  getLookups() {
    this.claimDeclineReasons = this.ToArray(ClaimDeclineReasonEnum);
  }
   ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }
  formatText(text: string): string {
     if (!text) return '<value missing from enum>';
  return text
    // Insert space before capital letters not at the start
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    // Insert space between letters and numbers
    .replace(/([a-zA-Z])([0-9])/g, '$1 $2')
    // Insert space between numbers and letters
    .replace(/([0-9])([a-zA-Z])/g, '$1 $2')
    .trim();
  }
  getReason(value:string): number{
    return +ClaimDeclineReasonEnum[value];
  }
}
